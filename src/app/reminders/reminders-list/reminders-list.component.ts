import {Component, HostListener, OnDestroy, OnInit} from '@angular/core';
import {Reminder} from '../reminder.model';
import {ReminderService} from '../services/reminder.service';
import {HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';
import {BehaviorSubject, Subscription} from 'rxjs';
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
  private selectChangeSub: Subscription;

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
      if (this.selectedIdx === 0) {
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
    if ($event) {
      $event.preventDefault();
    }
    if (this.selectedIdx <= 0) {
      return;
    }
    this.selectedChange.next(this.selectedIdx - 1);
  }

  toggleDone(r: Reminder) {
    const updated = {
      ...r,
      done: !r.done,
    };

    this.reminderService.update(r.id, updated).subscribe(() => {
      r = updated;
    });
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
    this.reminderService
      .deleteMany(this.doneIds())
      .subscribe(() => {
        console.log('Delete many success');
        this.fetchReminders();
      }, (error: HttpErrorResponse) => {
        console.log('ERROR', error.error);
      });
  }

  editSelectedReminder() {
    const selected = this.reminders[this.selectedIdx];
    this.router.navigate(['reminders', 'edit', selected.id], {
      queryParams: {
        selectedRow: this.selectedIdx + 1
      }
    });
  }

  gotoReminderAdd($event: KeyboardEvent) {
    // Prevent the pressed key to populate the form on the next page
    // Another solution would be to use the keyup event, but I don't like its delay
    $event.preventDefault();

    this.router.navigate(['reminders', 'add'], {
      queryParams: {
        selectedRow: this.selectedIdx + 1
      }
    });
  }

  private fetchReminders() {
    this.reminderService.getAll()
      .subscribe(data => {
        this.reminders = data;
        if (this.selectedIdx >= this.reminders.length) {
          // Ensure highlighted row is always logical, especially after delete
          this.selectedChange.next(this.reminders.length - 1);
        }
      }, (err: HttpErrorResponse) => {
        console.log(err.error);
        alert('Something went wrong!');
      });
  }
}
