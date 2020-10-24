import {Component, OnInit} from '@angular/core';
import {AuthService} from '../../services/auth.service';

@Component({
  template: '',
  selector: 'app-logout'
})
export class LogoutComponent implements OnInit {

  constructor(private authService: AuthService) {
  }

  ngOnInit(): void {
    this.authService.logout();
  }

}
