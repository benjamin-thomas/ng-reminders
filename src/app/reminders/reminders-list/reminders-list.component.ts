import {Component, HostListener, OnInit} from '@angular/core';
import {Reminder} from '../reminder.model';
import {ReminderService} from '../services/reminder.service';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-reminders-list',
  templateUrl: './reminders-list.component.html',
  styleUrls: ['./reminders-list.component.scss']
})
export class RemindersListComponent implements OnInit {
  reminders: Reminder[];
  selectedIdx = 0;

  constructor(private reminderService: ReminderService) {
  }

  ngOnInit(): void {
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
    this.selectedIdx += 1;
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
    this.selectedIdx -= 1;
  }

  toggleDone(r: Reminder) {
    // r.done = !r.done;
    const updated = {
      ...r,
      done: !r.done,
    };
    // remove email and id
    // delete updated['email'] ; // Why am I getting this field here?? Not handled by the server
    delete updated.id;
    // console.log('updated:', updated);
    this.reminderService.update(r.id, updated).subscribe(() => {
      // console.log('Server handled!');
      // r = updated; // Not updating...
      // console.log('original:', r);
      // console.log('updated:', updated);
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
