import {Component, HostListener, OnInit} from '@angular/core';
import {Reminder} from '../reminder.model';
import {ReminderService} from '../../../reminder.service';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-reminders-list',
  templateUrl: './reminders-list.component.html',
  styleUrls: ['./reminders-list.component.scss']
})
export class RemindersListComponent implements OnInit {
  reminders: Reminder[];

  constructor(
    private reminderService: ReminderService,
    private router: Router) {
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


  // I probably should create a custom link component for that
  @HostListener('document:keydown.alt.n')
  private navigateToReminderAdd() {
    this.router.navigate(['/reminders/add']);
  }
}
