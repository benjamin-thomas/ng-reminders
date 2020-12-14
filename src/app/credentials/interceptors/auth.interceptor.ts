import {Injectable} from '@angular/core';
import {HttpClient, HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';

const excludes = [
  '/signup',
  '/login',
  '/select-backend',
];

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor(private http: HttpClient) {
  }

  get csrfToken(): string {
    // private http: HttpClient
    // if (!!document.cookie) {

    // fetch('http://localhost:8080/csrf', { mode: 'no-cors' })
    //   .then((res) => res.headers.forEach((k,v) => console.log({k,v})));
    this.http.get('http://localhost:8080/csrf', {
      observe: 'response', // access response headers
      withCredentials: true,
      headers: {
      //   'Access-Control-Allow-Origin': '*',
      //   'Access-Control-Allow-Headers': 'Set-Cookie',
      //   'Access-Control-Request-Headers': 'Set-Cookie',
      }
    }).subscribe((res) => {
      const x = res.headers.get('XSRF-TOKEN');
      const vals = res.headers.keys();
      console.log({x});
      console.log({vals});
      vals.forEach(v => console.log({v}));
    }); // Force cookie download for CSRF
    // }
    return 'hello';
  }

  get token(): string {
    return localStorage.getItem('token');
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.endsWith('/csrf')) {
      return next.handle(request);
    }
    // let exclude: string;
    // excludes.forEach(pattern => {
    //   if (request.url.endsWith(pattern)) {
    //     exclude = request.url;
    //   }
    // });
    // if (exclude) {
    //   return next.handle(request);
    // }

    return next.handle(request.clone({
      setHeaders: {
        'XSRF-Token': this.csrfToken
      }
    }));
  }
}
