import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Reminder} from './components/reminders/reminder.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private static readonly URL = 'http://localhost:4444/reminders';

  constructor(private http: HttpClient) {
  }

  get token(): string {
    return localStorage.getItem('token');
  }

  getAll(): Observable<Reminder[]> {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    return this.http
      .get<Reminder[]>(ReminderService.URL, {headers});
  }

  add(reminder: Reminder) {
    const headers = new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });

    return this.http
      .post<Reminder>(ReminderService.URL, reminder, {headers});
  }
}
