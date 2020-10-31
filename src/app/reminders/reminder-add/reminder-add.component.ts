import {Component, OnInit} from '@angular/core';
import {ReminderService} from '../services/reminder.service';
import {FormControl, FormGroup} from '@angular/forms';
import {formatDate} from '@angular/common';
import {HttpErrorResponse} from '@angular/common/http';
import {ActivatedRoute, Router} from '@angular/router';

@Component({
  selector: 'app-reminder-add',
  templateUrl: './reminder-add.component.html',
  styleUrls: ['./reminder-add.component.scss']
})
export class ReminderAddComponent implements OnInit {
  inOneHour = new Date(Date.now() + 1000 * 60 * 60);
  defaultDate = formatDate(this.inOneHour, 'yyyy-MM-ddTHH:mm', 'en');

  form = new FormGroup({
    content: new FormControl(''),
    done: new FormControl(false),
    due: new FormControl(this.defaultDate),
  });
  private selectedRow: number;

  constructor(private reminderService: ReminderService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(p => {
      this.selectedRow = p.selectedRow;
    });
  }

  onValidSubmit() {
    this.reminderService
      .create(this.form.value)
      .subscribe(data => {
        console.log('Ok (null is returned here):', data);
        this.router.navigate(['reminders', 'list'], {
          queryParams: {
            selectedRow: this.selectedRow
          }
        });
      }, (err: HttpErrorResponse) => {
        alert('Something bad happened!');
        console.log('Something failed!', err.error);
      });
  }
}
