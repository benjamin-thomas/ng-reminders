import {Component, EventEmitter, Input, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';

@Component({
  selector: 'app-credentials-form',
  templateUrl: './credentials-form.component.html',
  styleUrls: ['./credentials-form.component.scss']
})
export class CredentialsFormComponent {
  @Input() title: string;
  @Input() showPasswordReset = false;
  @Input() buttonTitle: string;

  @Output() handleValidSubmit = new EventEmitter<{ email: string, password: string }>();

  email = new FormControl();
  password = new FormControl();
  form = new FormGroup({
    email: this.email,
    password: this.password
  });

  constructor() {
    this.email.setValue('user@example.com')
    this.password.setValue('123')
  }

  onSubmit() {
    if (!this.form.valid) {
      return;
    }

    this.handleValidSubmit.emit({email: this.email.value, password: this.password.value});
  }
}
