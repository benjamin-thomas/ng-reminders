import { Component, OnInit } from '@angular/core';
import {Router} from '@angular/router';

@Component({
  template: '',
  selector: 'app-logout'
})
export class LogoutComponent implements OnInit {

  constructor(private router: Router) { }

  ngOnInit(): void {
    localStorage.removeItem('token');
    this.router.navigate(['login']);
  }

}
