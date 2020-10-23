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

  private get headers() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.token}`
    });
  }

  private get headers2() {
    return new HttpHeaders({
      Authorization: `Bearer ${this.token}`,
      Accept: 'application/vnd.pgrst.object+json', // returns a single item, vs Array
    });
  }

  private static URL2(id) {
    return `http://localhost:4444/reminders?id=eq.${id}`;
  }

  getAll(): Observable<Reminder[]> {
    return this.http
      .get<Reminder[]>(ReminderService.URL + '?order=due.asc', {headers: this.headers});
  }

  create(reminder: Reminder) {
    return this.http
      .post<Reminder>(ReminderService.URL, reminder, {headers: this.headers});
  }

  get(id: number) {
    return this.http
      .get<Reminder>(ReminderService.URL2(id), {headers: this.headers2});
  }

  update(id: number, reminder: Reminder) {
    return this.http
      .patch<Reminder>(ReminderService.URL2(id), reminder, {headers: this.headers2});
  }
}
