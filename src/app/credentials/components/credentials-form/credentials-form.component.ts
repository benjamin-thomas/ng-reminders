import {Component, EventEmitter, Input, OnInit, Output} from '@angular/core';
import {FormControl, FormGroup} from '@angular/forms';
import {AuthService} from '../../services/auth.service';

@Component({
  selector: 'app-credentials-form',
  templateUrl: './credentials-form.component.html',
  styleUrls: ['./credentials-form.component.scss']
})
export class CredentialsFormComponent implements OnInit {
  @Input() title: string;
  @Input() showPasswordReset = false;
  @Input() buttonTitle: string;

  @Output() handleSubmit = new EventEmitter<{ email: string, password: string }>();

  email = new FormControl();
  password = new FormControl();
  form = new FormGroup({
    email: this.email,
    password: this.password
  });

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
  }

  onSubmit() {
    if (!this.form.valid) {
      return;
    }

    this.handleSubmit.emit({email: this.email.value, password: this.password.value});
  }
}
