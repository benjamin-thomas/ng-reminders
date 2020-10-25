import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Reminder} from '../reminder.model';
import {Observable} from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {
  private static readonly URL = 'http://localhost:4444/reminders';

  constructor(private http: HttpClient) {
  }

  private static get singleResourceHeader() {
    return new HttpHeaders({
      Accept: 'application/vnd.pgrst.object+json', // returns a single item, vs Array
    });
  }

  private static URL2(id) {
    return `http://localhost:4444/reminders?id=eq.${id}`;
  }

  getAll(): Observable<Reminder[]> {
    return this.http
      .get<Reminder[]>(ReminderService.URL + '?order=due.asc');
  }

  create(reminder: Reminder) {
    return this.http
      .post<Reminder>(ReminderService.URL, reminder);
  }

  get(id: number) {
    return this.http
      .get<Reminder>(ReminderService.URL2(id), {headers: ReminderService.singleResourceHeader});
  }

  update(id: number, reminder: Reminder) {
    return this.http
      .patch<Reminder>(ReminderService.URL2(id), reminder, {headers: ReminderService.singleResourceHeader});
  }
}
