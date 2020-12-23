import {Component, ElementRef, HostListener, isDevMode, OnDestroy, OnInit, ViewChild} from '@angular/core';
import {Reminder} from '../reminder.model';
import {PaginatedRemindersResponse, ReminderService} from '../services/reminder.service';
import {HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, interval, range, Subscription} from 'rxjs';
import {take} from 'rxjs/operators';
import * as moment from 'moment';

@Component({
  selector: 'app-reminders-list',
  templateUrl: './reminders-list.component.html',
  styleUrls: ['./reminders-list.component.scss']
})
export class RemindersListComponent implements OnInit, OnDestroy {

  constructor(private reminderService: ReminderService,
              private route: ActivatedRoute,
              private router: Router) {
  }

  static autoRefreshDefault = 59;

  reminders: Reminder[];
  selectedChange = new BehaviorSubject<number>(0);
  selectedIdx: number;
  editingSearch = false;
  searchTerm = '';
  @ViewChild('searchTermInput') searchTermInput: ElementRef;
  total: number;
  isDevMode = isDevMode();
  isDue = true;
  pushBackFromNow = true;

  private selectChangeSub: Subscription;
  private previousSelectedIdx: number;

  private currPage = 1;
  private perPage = 10;

  private autoRefreshInSeconds = RemindersListComponent.autoRefreshDefault;
  private inactiveSub: Subscription;

  ngOnDestroy(): void {
    this.selectChangeSub.unsubscribe();
    this.inactiveSub.unsubscribe();
  }

  ngOnInit(): void {

    this.inactiveSub = interval(1000).subscribe(() => {
      this.autoRefreshInSeconds--;
      if (this.autoRefreshInSeconds <= 0) {
        this.reQuery(); // refresh
        this.autoRefreshInSeconds = RemindersListComponent.autoRefreshDefault;
      }
    });

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

  @HostListener('document:keydown')
  @HostListener('document:click')
  resetInactivityTimer() {
    this.autoRefreshInSeconds = RemindersListComponent.autoRefreshDefault;
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
          if (this.searchTerm) {
            this.doSearch(); // then redo a search
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

  doSearch() {
    this.currPage = 1;
    this.reQuery();
  }

  @HostListener('document:keydown.s', ['$event'])
  @HostListener('document:keydown./', ['$event'])
  focusSearch($event: KeyboardEvent) {
    if (this.editingSearch) { // Actually typing one of the trigger keys
      return;
    }
    $event.preventDefault(); // do not fill input with the shortcut trigger key
    const {nativeElement} = this.searchTermInput;
    nativeElement.focus();
    nativeElement.select();
  }

  unselectRow() {
    this.previousSelectedIdx = this.selectedIdx;
    this.selectedChange.next(null); // remove row highlighting + URL reference
    return;
  }

  restoreSelectedRow() {
    if (this.searchTerm) {
      // Do not attempt to restore the previously highlighted row after a search
      // Instead, highlight the first row
      this.selectedChange.next(0);
      return;
    }
    this.selectedChange.next(this.previousSelectedIdx);
  }

  loadBogus() {
    range(1, 100).subscribe((n) => {
      const r = new Reminder(`bogus #${n}`, new Date());
      this.reminderService.create(r).subscribe();
    });
  }

  selectAll(bool: boolean) {
    this.reminders.forEach((r) => {
      this.reminderService.update(r.id, r).subscribe(() => {
        r.done = bool; // update the UI after persist
      });
    });
  }

  fetchMoreReminders() {
    const previousReminders = this.reminders;
    this.currPage += 1;
    this.fetchReminders(() => {
      const newReminders = this.reminders;
      this.reminders = previousReminders;
      this.reminders.push(...newReminders);
    });
  }

  reQuery() {
    console.log('Re-querying...', {isDue: this.isDue});
    this.fetchReminders();
  }

  emitSelectedChange(idx: number, $event: MouseEvent) {
    const target = $event.target as HTMLElement;
    const pushingBack = target.tagName === 'BUTTON';
    if (pushingBack) {
      return;
    }
    this.selectedChange.next(idx);
  }

  pushBack(r: Reminder, addSeconds: number) {
    const strDate = r.due; // 2020-11-16T07:20:00
    let newDate;
    if (this.pushBackFromNow) {
      newDate = moment().add(addSeconds, 'seconds');
    } else {
      newDate = moment(strDate).add(addSeconds, 'seconds');
    }
    const newStrDate = newDate.format('YYYY-MM-DDTHH:mm:ss');

    // Satisfy pgrest backend format for now, not sure how to pass dates effectively yet
    this.reminderService.pushBack(r.id, newStrDate).subscribe(() => {
      this.fetchReminders();
    });
  }

  pushBackFromNowChar(): string {
    if (this.pushBackFromNow) {
      return '>';
    }
    return '+';
  }

  private fetchReminders(doAfterFetch?: () => void) {
    let searchContentLike: string;
    if (this.searchTerm && !this.searchTerm.includes('*')) {
      searchContentLike = `*${this.searchTerm}*`;
    }
    this.reminderService.getAll(this.currPage, this.perPage, searchContentLike, this.isDue)
      .subscribe((resp: PaginatedRemindersResponse) => {
        const data = resp.items;
        this.total = resp.total;
        this.reminders = data;

        if (this.selectedIdx >= this.reminders.length) {
          // Ensure highlighted row is always logical, especially after delete
          this.selectedChange.next(this.reminders.length - 1);
        }
        if (doAfterFetch) {
          doAfterFetch();
        }
      }, (err: HttpErrorResponse) => {
        console.log(err.error);
        console.log(err);
        alert('Something went wrong!');
      });
  }
}
