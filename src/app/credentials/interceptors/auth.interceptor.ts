import {Injectable} from '@angular/core';
import {
  HttpBackend,
  HttpClient,
  HttpErrorResponse,
  HttpEvent,
  HttpHandler,
  HttpInterceptor,
  HttpRequest
} from '@angular/common/http';
import {Observable, throwError} from 'rxjs';
import {CookieService} from 'ngx-cookie-service';
import {catchError, map, switchMap} from 'rxjs/operators';
import {BackendSelectService} from '../../backend/backend-select/service/backend-select.service';
import {Backend} from '../../backend/backend.model';

@Injectable()
export class AuthInterceptor implements HttpInterceptor {
  private httpNoIntercept: HttpClient;
  private backend: Backend;

  constructor(private http: HttpClient,
              private httpBackend: HttpBackend,
              private cookieService: CookieService,
              private backendSelectService: BackendSelectService) {

    this.httpNoIntercept = new HttpClient(httpBackend);

    // I don't think I need to unsubscribe here (no destroy logic)
    this.backendSelectService.emitter.subscribe(([backend]) => {
      this.backend = backend;
    });
  }

  private static authenticateAndHandle(request: HttpRequest<unknown>, next: HttpHandler, token: string) {
    const req = request.clone({
      setHeaders: {
        'X-XSRF-TOKEN': token,
      },
      withCredentials: true, // send the XSRF-TOKEN + sid cookies too
    });

    // catchError(err => this.handleError(err))
    return next.handle(req).pipe(catchError(AuthInterceptor.handleError));
  }

  private static handleError(err: HttpErrorResponse): Observable<HttpEvent<unknown>> {
    let errMsg: string;
    if (err?.message) {
      errMsg = `CAUGHT: ${err.message}`;
    } else {
      errMsg = 'Oops, something failed';
    }
    return throwError(errMsg);
  }

  async csrfToken() {
    const token = this.cookieService.get('XSRF-TOKEN');
    if (token) {
      return token;
    }
  }

  intercept(request: HttpRequest<unknown>, next: HttpHandler): Observable<HttpEvent<unknown>> {
    const token = this.cookieService.get('XSRF-TOKEN');
    if (token) {
      console.log('Using existing XSRF token:', token);
      return AuthInterceptor.authenticateAndHandle(request, next, token);
    }

    return this.fetchXsrfToken().pipe(
      switchMap((token) => {
        console.log('Fetched new XSRF token:', token);
        return AuthInterceptor.authenticateAndHandle(request, next, token);
      })
    );

  }

  private fetchXsrfToken(): Observable<string> {
    return this.httpNoIntercept.get<null>(this.backend.csrfURL(), {
      withCredentials: true,
    }).pipe(
      map(() => this.cookieService.get('XSRF-TOKEN'))
    );
  }
}
