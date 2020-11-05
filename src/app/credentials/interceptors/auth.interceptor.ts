import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';

const excludes = [
  '/signup',
  '/login',
  '/select-backend',
];
@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {
  }

  get token(): string {
    return localStorage.getItem('token');
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    let exclude: string;
    excludes.forEach(pattern => {
      if (request.url.endsWith(pattern)) {
        exclude = request.url;
      }
    });
    if (exclude) {
      return next.handle(request);
    }

    return next.handle(request.clone({
      setHeaders: {
        Authorization: `Bearer ${this.token}`
      }
    }));
  }
}
