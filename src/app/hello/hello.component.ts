import {Component, OnInit} from '@angular/core';
import {HttpBackend, HttpClient, HttpResponse} from '@angular/common/http';
import {CookieService} from 'ngx-cookie-service';

@Component({
  selector: 'app-hello',
  templateUrl: './hello.component.html',
  styleUrls: ['./hello.component.scss']
})
export class HelloComponent implements OnInit {
  message: string;

  // https://levelup.gitconnected.com/the-correct-way-to-make-api-requests-in-an-angular-application-22a079fe8413
  private httpNoIntercept: HttpClient;
  xsrf: string;

  constructor(private httpBackend: HttpBackend,
              private cookieService: CookieService) {
    this.httpNoIntercept = new HttpClient(httpBackend) // no interceptors
  }

  ngOnInit(): void {
    this.httpNoIntercept.get<string>('https://api-proxy.reminders.test/csrf', {
      observe: 'response',
      withCredentials: true, // required for API cookies to be set
    }).subscribe((res: HttpResponse<string>) => {
      this.xsrf = this.cookieService.get('XSRF-TOKEN');
      const vals = res.headers.keys();
      console.log({xsrf: this.xsrf});
      console.log({vals});
      vals.forEach(v => console.log({v}));
      console.log({res, localCookies: document.cookie});
      this.message = res.body;
    })
  }

  increment10() {
    this.httpNoIntercept.post<string>('https://api-proxy.reminders.test/csrf', null, {
      withCredentials: true,
      headers: {
        'X-XSRF-TOKEN': escape(this.cookieService.get('XSRF-TOKEN')),
        // 'Access-Control-Request-Method': 'POST',
        // 'Access-Control-Request-Headers': 'X-XSRF-TOKEN, Content-Type',
      }
    }).subscribe(res => {
      console.log({res});
    });
  }
}
