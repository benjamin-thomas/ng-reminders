import {Component, OnDestroy, OnInit} from '@angular/core';
import {NavigationEnd, Router} from '@angular/router';
import {filter} from 'rxjs/operators';
import {Subscription} from 'rxjs';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit, OnDestroy {
  showNavBar = false;
  private sub: Subscription;

  constructor(private router: Router) {
  }

  ngOnInit(): void {
    this.sub = this.router.events.pipe(
      filter(evt => evt instanceof NavigationEnd)
    ).subscribe((nav: NavigationEnd) => {
      this.showNavBar = !['/login', '/signup', '/select-backend'].includes(nav.url);
    });
  }

  ngOnDestroy(): void {
    this.sub?.unsubscribe();
  }


}
