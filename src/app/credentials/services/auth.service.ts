import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {take} from 'rxjs/operators';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Router} from '@angular/router';
import {interval, Subscription} from 'rxjs';
import {BackendSelectService} from '../../backend/backend-select/service/backend-select.service';
import {Backend} from '../../backend/backend.model';
import {PostgrestBackend} from '../../backend/postgrest-backend';

export interface AuthResponse {
  token: string;
}

const SECONDS = 1000;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private helper = new JwtHelperService();
  private expirationSub: Subscription;
  private backend: Backend;

  constructor(private http: HttpClient,
              private router: Router,
              private backendSelectService: BackendSelectService) {

    // No unsubscription as the service lives for the application's lifetime
    this.backendSelectService.emitter.subscribe(([backend]) => {
      this.backend = backend;
    });
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
    return !this.helper.isTokenExpired(token);
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
      .post<AuthResponse>(url, {email, pass: password}, {headers})
      .pipe(take(1))
      .subscribe(data => {

        if (this.backend instanceof PostgrestBackend) {
          if (url === this.backend.signupURL()) {
            data.token = data.token.slice(1, data.token.length - 1);
          }
        }
        localStorage.setItem('token', data.token);
        const tokenExpirationDate = this.helper.getTokenExpirationDate(data.token);
        this.expirationSub = interval(1000).subscribe(() => {
          const almostExpired = tokenExpirationDate.getTime() - 10 * SECONDS;
          if (Date.now() < almostExpired) {
            // NOOP, early exit
            return;
          }
          console.log('Token will expire in 10 seconds, auto renewing:', new Date());
          this.expirationSub.unsubscribe();
          this.login(email, password);
          // this.router.navigate(['/login']);
        });

        this.router.navigate(['reminders', 'list']);
      }, ((err: HttpErrorResponse) => {
        console.log('Something failed!', err.error);
        alert(err.error.message);
      }));
  }
}
