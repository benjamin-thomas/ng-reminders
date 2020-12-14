import {Component, OnInit} from '@angular/core';
import {HttpBackend, HttpClient, HttpResponse} from '@angular/common/http';

@Component({
  selector: 'app-hello',
  templateUrl: './hello.component.html',
  styleUrls: ['./hello.component.scss']
})
export class HelloComponent implements OnInit {
  message: string;

  // https://levelup.gitconnected.com/the-correct-way-to-make-api-requests-in-an-angular-application-22a079fe8413
  private httpNoIntercept: HttpClient;

  constructor(private httpBackend: HttpBackend) {
    this.httpNoIntercept = new HttpClient(httpBackend) // no interceptors
  }

  ngOnInit(): void {
    this.httpNoIntercept.get<string>('https://api-proxy.reminders.test/csrf', {
      observe: 'response',
      withCredentials: true, // required for API cookies to be set
    }).subscribe((res: HttpResponse<string>) => {
      const x = res.headers.get('XSRF-TOKEN');
      const vals = res.headers.keys();
      console.log({x});
      console.log({vals});
      vals.forEach(v => console.log({v}));
      console.log({res, localCookies: document.cookie});
      this.message = res.body;
    })
  }

}
