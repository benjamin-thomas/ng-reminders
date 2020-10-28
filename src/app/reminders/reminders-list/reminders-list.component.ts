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

  @HostListener('document:keydown.arrowDown')
  @HostListener('document:keydown.j')
  selectRowDown() {
    if (this.selectedIdx >= this.reminders.length - 1) {
      return;
    }
    this.selectedIdx += 1;
  }

  @HostListener('document:keydown.arrowUp')
  @HostListener('document:keydown.k')
  selectRowUp() {
    if (this.selectedIdx <= 0) {
      return;
    }
    this.selectedIdx -= 1;
  }
}
