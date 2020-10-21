import { Component, OnInit } from '@angular/core';
import {ReminderService} from '../../../reminder.service';
import {FormControl, FormGroup} from '@angular/forms';
import {formatDate} from '@angular/common';
import {HttpErrorResponse} from '@angular/common/http';
import {Router} from '@angular/router';

@Component({
  selector: 'app-reminder-add',
  templateUrl: './reminder-add.component.html',
  styleUrls: ['./reminder-add.component.scss']
})
export class ReminderAddComponent implements OnInit {
  inOneHour = new Date(Date.now() + 1000 * 60 * 60);
  defaultDate = formatDate(this.inOneHour, 'yyyy-MM-ddTHH:mm', 'en');

  form = new FormGroup({
    content: new FormControl(`This is my content at ${Date.now()}`),
    done: new FormControl(false),
    due: new FormControl(this.defaultDate),
  });

  constructor(
    private reminderService: ReminderService,
    private router: Router) {
  }

  ngOnInit(): void {
  }

  onSubmit() {
    this.reminderService
      .create(this.form.value)
      .subscribe(data => {
        console.log('Ok (null is returned here):', data);
        this.router.navigate(['reminders', 'list']);
      }, (err: HttpErrorResponse) => {
        alert('Something bad happened!');
        console.log('Something failed!', err.error);
      });
  }
}
