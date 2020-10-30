import {Component, HostListener, OnDestroy, OnInit, ViewChild} from '@angular/core';
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
  @ViewChild('editSelectedResource') editSelectedResource: HTMLAnchorElement;
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

    this.reminderService.getAll()
      .subscribe(data => {
        this.reminders = data;
      }, (err: HttpErrorResponse) => {
        console.log(err.error);
        alert('Something went wrong!');
      });
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

    delete updated.id;
    this.reminderService.update(r.id, updated).subscribe(() => {
      // const updated2 = {
      //   id: r.id,
      //   ...updated,
      // };
      // console.log('updated2:', updated2);
      // r = updated2; // Not working
      // r = {...updated2}; // Not working either
      r.done = updated.done;
    });
  }
}
