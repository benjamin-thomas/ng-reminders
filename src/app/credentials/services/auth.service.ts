import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {take} from 'rxjs/operators';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Router} from '@angular/router';
import {interval, Subscription} from 'rxjs';

// http POST http://localhost:4444/rpc/login email=user1@example.com pass=yo
export interface AuthResponse {
  token: string;
}

const SECONDS = 1000;

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private static readonly LOGIN_URL = 'http://localhost:4444/rpc/login';
  private static readonly SIGNUP_URL = 'http://localhost:4444/rpc/signup';
  private helper = new JwtHelperService();
  private expirationSub: Subscription;

  constructor(private http: HttpClient,
              private router: Router) {
  }


  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
    return !this.helper.isTokenExpired(token);
  }

  login(email: string, password: string) {
    this.handleAuth(AuthService.LOGIN_URL, email, password);
  }

  signup(email: string, password: string) {
    this.handleAuth(AuthService.SIGNUP_URL, email, password);
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
        console.log('Successfully signed up!');
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
