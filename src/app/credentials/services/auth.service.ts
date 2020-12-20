import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {take} from 'rxjs/operators';
import {Router} from '@angular/router';
import {BackendSelectService} from '../../backend/backend-select/service/backend-select.service';
import {Backend} from '../../backend/backend.model';
import {CookieService} from 'ngx-cookie-service';

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private backend: Backend;

  constructor(private http: HttpClient,
              private router: Router,
              private backendSelectService: BackendSelectService,
              private cookieService: CookieService) {

    // No unsubscription as the service lives for the application's lifetime
    this.backendSelectService.emitter.subscribe(([backend]) => {
      this.backend = backend;
    });
  }

  isLoggedIn(): boolean {
    return !!this.cookieService.get('XSRF-TOKEN');
  }

  login(email: string, password: string) {
    console.log('Logging to:', this.backend.loginURL());
    this.handleAuth(this.backend.loginURL(), email, password);
  }

  signup(email: string, password: string) {
    this.handleAuth(this.backend.signupURL(), email, password);
  }

  logout() {
    localStorage.removeItem('token');
    this.router.navigate(['login']);
  }

  private handleAuth(url: string, email: string, password) {
    const headers = new HttpHeaders({
      Accept: 'application/vnd.pgrst.object+json', // returns a single item, vs Array
    });
    this.http
      .post<void>(url, {email, password}, {headers})
      .pipe(take(1))
      .subscribe(
        () => {
          this.router.navigate(['reminders', 'list']);
        },
        (err: HttpErrorResponse) => {
          console.log('Something failed!', err.error);
          alert(err.error.message);
        });
  }
}
