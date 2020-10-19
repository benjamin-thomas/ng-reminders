import {Component, Input, OnInit} from '@angular/core';

@Component({
  selector: 'app-credentials-form',
  templateUrl: './credentials-form.component.html',
  styleUrls: ['./credentials-form.component.scss']
})
export class CredentialsFormComponent implements OnInit {
  @Input() title: string;
  @Input() showPasswordReset = false;
  @Input() buttonTitle: string;

  constructor() { }

  ngOnInit(): void {
  }

}
