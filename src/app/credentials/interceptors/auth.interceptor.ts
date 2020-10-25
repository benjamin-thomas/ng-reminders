import {Injectable} from '@angular/core';
import {HttpEvent, HttpHandler, HttpInterceptor, HttpRequest} from '@angular/common/http';
import {Observable} from 'rxjs';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {

  constructor() {
  }

  get token(): string {
    return localStorage.getItem('token');
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    if (request.url.endsWith('/login')) { // Not really a problem anyways
      return next.handle(request);
    }

    return next.handle(request.clone({
      setHeaders: {
        Authorization: `Bearer ${this.token}`
      }
    }));
  }
}
