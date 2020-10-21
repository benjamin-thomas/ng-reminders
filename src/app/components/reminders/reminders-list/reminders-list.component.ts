import {Component, OnInit} from '@angular/core';
import {Reminder} from '../reminder.model';
import {ReminderService} from '../../../reminder.service';

@Component({
  selector: 'app-reminders-list',
  templateUrl: './reminders-list.component.html',
  styleUrls: ['./reminders-list.component.scss']
})
export class RemindersListComponent implements OnInit {

  yesterday = new Date(new Date().getTime() - 1000 * 60 * 60 * 24);
  reminders = [
    new Reminder('hello', this.yesterday),
    new Reminder('hello2', this.yesterday),
    new Reminder('hello3', this.yesterday),
    new Reminder('hello4', this.yesterday),
    new Reminder('hello5', this.yesterday),
    ];

  constructor(private reminderService: ReminderService) {
  }

  ngOnInit(): void {
    // this.reminderService.getAll()
    //   .subscribe(data => {
    //     this.reminders = data;
    //   }, (error: HttpErrorResponse) => {
    //     alert('Something went wrong!');
    //   });
  }


}
