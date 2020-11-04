import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {ReminderService} from '../services/reminder.service';
import {ActivatedRoute, Router} from '@angular/router';
import {formatDate} from '@angular/common';

@Component({
  selector: 'app-reminder-edit',
  templateUrl: './reminder-edit.component.html',
  styleUrls: ['./reminder-edit.component.scss']
})
export class ReminderEditComponent implements OnInit {

  form = new FormGroup({
    content: new FormControl('', [Validators.required]),
    done: new FormControl(),
    due: new FormControl(),
  });
  private id: number;
  private selectedRow: number;

  constructor(private reminderService: ReminderService,
              private router: Router,
              private route: ActivatedRoute) {
  }

  ngOnInit(): void {
    this.route.params.subscribe(params => {
      this.selectedRow = params.selectedRow;

      this.reminderService.get(params.id).subscribe(reminder => {
        this.id = reminder.id;

        const due = formatDate(reminder.due, 'yyyy-MM-ddTHH:mm', 'en');
        this.form.controls.content.setValue(reminder.content);
        this.form.controls.done.setValue(reminder.done);
        this.form.controls.due.setValue(due);
      });

    });
  }

  onValidSubmit() {
    this.reminderService.update(this.id, this.form.value).subscribe(() => {
      this.router.navigate(['/reminders', 'list'], {
        queryParams: {
          selectedRow: this.selectedRow
        }
      });
    });
  }
}
