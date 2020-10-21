import {Component, OnInit} from '@angular/core';
import {Reminder} from '../reminder.model';
import {ReminderService} from '../../../reminder.service';
import {HttpErrorResponse} from '@angular/common/http';

@Component({
  selector: 'app-reminders-list',
  templateUrl: './reminders-list.component.html',
  styleUrls: ['./reminders-list.component.scss']
})
export class RemindersListComponent implements OnInit {
  reminders: Reminder[];

  constructor(private reminderService: ReminderService) {
  }

  ngOnInit(): void {
    this.reminderService.getAll()
      .subscribe(data => {
        this.reminders = data;
      }, (error: HttpErrorResponse) => {
        alert('Something went wrong!');
      });
  }


}
