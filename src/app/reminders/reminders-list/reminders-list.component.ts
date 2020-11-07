import {Component, ElementRef, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Reminder} from '../reminder.model';
import {ReminderService} from '../services/reminder.service';
import {HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, range, Subscription} from 'rxjs';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-reminders-list',
  templateUrl: './reminders-list.component.html',
  styleUrls: ['./reminders-list.component.scss']
})
export class RemindersListComponent implements OnInit, OnDestroy {
  reminders: Reminder[];
  selectedChange = new BehaviorSubject<number>(0);
  selectedIdx: number;
  editingSearch = false;
  @ViewChild('searchTerm') searchTerm: ElementRef;
  private selectChangeSub: Subscription;
  private previousSelectedIdx: number;
  private origReminders: Reminder[];

  constructor(private reminderService: ReminderService,
              private route: ActivatedRoute,
              private router: Router) {

  }

  ngOnDestroy(): void {
    this.selectChangeSub.unsubscribe();
  }

  ngOnInit(): void {

    // Hydrate selected row from params, once (on first page load)
    this.route.queryParams.pipe(take(1))
      .subscribe((p) => {
        if (!p.selectedRow) { // no query param set
          return;
        }

        this.selectedChange.next(+p.selectedRow - 1);
      });

    this.selectChangeSub = this.selectedChange.subscribe((id) => {
      this.selectedIdx = id;

      // Don't update URL for first row
      if (this.selectedIdx === 0 || this.selectedIdx === null) {
        this.router.navigate([]);
        return;
      }

      this.router.navigate([], {
        queryParams: {
          selectedRow: this.selectedIdx + 1
        },
      });
    });
    this.fetchReminders();
  }

  @HostListener('document:keydown.arrowDown', ['$event'])
  @HostListener('document:keydown.j')
  selectRowDown($event: KeyboardEvent) {
    if (this.editingSearch) {
      return;
    }
    if ($event) {
      $event.preventDefault();
    }
    if (this.selectedIdx >= this.reminders.length - 1) {
      return;
    }
    this.selectedChange.next(this.selectedIdx + 1);
  }

  @HostListener('document:keydown.arrowUp', ['$event'])
  @HostListener('document:keydown.k')
  selectRowUp($event: KeyboardEvent) {
    if (this.editingSearch) {
      return;
    }
    if ($event) {
      $event.preventDefault();
    }
    if (this.selectedIdx <= 0) {
      return;
    }
    this.selectedChange.next(this.selectedIdx - 1);
  }

  toggleDone(r: Reminder) {
    // r.done = !r.done; // this would update the UI before server request
    const requestForUpdate = {
      ...r,
      done: !r.done,
    };

    this.reminderService.update(r.id, requestForUpdate).subscribe(() => {
      Object.assign(r, requestForUpdate); // `r = requestForUpdate` won't update the UI
    });
  }

  @HostListener('document:keydown.space', ['$event'])
  @HostListener('document:keydown.x', ['$event'])
  toggleDoneOnSelectedReminder($event: KeyboardEvent) {
    if (this.editingSearch) {
      return;
    }
    $event.preventDefault(); // prevent scrolling with the space bar

    const selected = this.reminders[this.selectedIdx];
    this.toggleDone(selected);
  }

  doneIds(): number[] {
    if (!this.reminders) {
      return [];
    }

    return this.reminders
      .filter(r => r.done)
      .map(r => r.id);
  }

  doneCount(): number {
    return this.doneIds().length;
  }

  @HostListener('document:keydown.d')
  @HostListener('document:keydown.delete')
  deleteAllDone() {
    if (this.editingSearch) {
      return;
    }
    this.reminderService
      .deleteMany(this.doneIds())
      .subscribe(() => {

        const maybeRedoSearch = () => {
          const term = this.searchTerm.nativeElement.value;
          if (term) {
            this.doSearch(term); // then redo a search
          }
        };

        this.fetchReminders(maybeRedoSearch); // refresh from the server

      }, (error: HttpErrorResponse) => {
        console.log('ERROR', error.error);
      });
  }

  @HostListener('document:keydown.enter')
  editSelectedReminder() {
    if (this.editingSearch) {
      return;
    }
    const selected = this.reminders[this.selectedIdx];
    this.router.navigate(['reminders', 'edit', selected.id], {
      queryParams: {
        selectedRow: this.selectedIdx + 1
      }
    });
  }

  gotoReminderAdd($event: KeyboardEvent) {
    if (this.editingSearch) {
      return;
    }
    // Prevent the pressed key to populate the form on the next page
    // Another solution would be to use the keyup event, but I don't like its delay
    $event.preventDefault();

    this.router.navigate(['reminders', 'add'], {
      queryParams: {
        selectedRow: this.selectedIdx + 1
      }
    });
  }

  doSearch(value: string) {
    this.reminders = this.origReminders.filter((r) => {
      return r.content.includes(value);
    });
  }

  @HostListener('document:keydown.s', ['$event'])
  @HostListener('document:keydown./', ['$event'])
  focusSearch($event: KeyboardEvent) {
    if (this.editingSearch) { // Actually typing one of the trigger keys
      return;
    }
    $event.preventDefault(); // do not fill input with the shortcut trigger key
    const {nativeElement} = this.searchTerm;
    nativeElement.focus();
    nativeElement.select();
  }

  unselectRow() {
    this.previousSelectedIdx = this.selectedIdx;
    this.selectedChange.next(null); // remove row highlighting + URL reference
    return;
  }

  // triggered from hitting the tab key from the search input
  restoreSelectedRow() {
    if (this.hasFilteredSet()) {
      // Do not attempt to restore the previously highlighted row after a search
      // Instead, highlight the first row
      this.selectedChange.next(0);
      return;
    }
    this.selectedChange.next(this.previousSelectedIdx);
  }

  restoreRemindersOnEmpty(value: string) {
    if (!value && this.hasFilteredSet()) {
      this.reminders = this.origReminders;
    }
  }

  loadBogus() {
    range(1, 100).subscribe((n) => {
      const r = new Reminder(`bogus #${n}`, new Date());
      this.reminderService.create(r).subscribe();
    });
  }

  private fetchReminders(doAfterFetch?: () => void) {
    this.reminderService.getAll()
      .subscribe(data => {
        this.reminders = data;
        this.origReminders = data;
        if (this.selectedIdx >= this.reminders.length) {
          // Ensure highlighted row is always logical, especially after delete
          this.selectedChange.next(this.reminders.length - 1);
        }
        if (doAfterFetch) {
          doAfterFetch();
        }
      }, (err: HttpErrorResponse) => {
        console.log(err.error);
        alert('Something went wrong!');
      });
  }

  private hasFilteredSet() {
    return this.reminders.length !== this.origReminders.length;
  }

  selectAll(bool: boolean) {
    this.reminders.forEach((r) => {
      r.done = bool;
      this.reminderService.update(r.id, r).subscribe(); // persist
    });
  }
}
