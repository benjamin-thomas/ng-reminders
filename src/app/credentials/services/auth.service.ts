import {Injectable} from '@angular/core';
import {HttpClient, HttpErrorResponse, HttpHeaders} from '@angular/common/http';
import {take} from 'rxjs/operators';
import {JwtHelperService} from '@auth0/angular-jwt';
import {Router} from '@angular/router';

// http POST http://localhost:4444/rpc/login email=user1@example.com pass=yo
export interface AuthResponse {
  token: string;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  private static readonly LOGIN_URL = 'http://localhost:4444/rpc/login';
  private helper = new JwtHelperService();

  constructor(private http: HttpClient,
              private router: Router) {
  }

  login(email: string, password: string) {
    const headers = new HttpHeaders({
      Accept: 'application/vnd.pgrst.object+json', // returns a single item, vs Array
    });
    this.http
      .post<AuthResponse>(AuthService.LOGIN_URL, {email, pass: password}, {headers})
      .pipe(take(1))
      .subscribe(data => {
        console.log('Successfully logged in!');
        localStorage.setItem('token', data.token);
        this.router.navigate(['reminders', 'list']);
      }, ((err: HttpErrorResponse) => {
        console.log('Something failed!', err.error);
        alert(err.error.message);
      }));
  }

  isLoggedIn(): boolean {
    const token = localStorage.getItem('token');
    if (!token) {
      return false;
    }
    return !this.helper.isTokenExpired(token);
  }
}
