import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders} from '@angular/common/http';
import {Reminder} from '../reminder.model';
import {Observable} from 'rxjs';
import {BackendSelectService} from '../../backend/backend-select/service/backend-select.service';
import {Backend} from '../../backend/backend.model';

@Injectable({
  providedIn: 'root'
})
export class ReminderService {

  private backend: Backend;

  constructor(private http: HttpClient,
              private backendSelectService: BackendSelectService) {
    // No unsubscription as the service lives for the application's lifetime
    this.backendSelectService.emitter.subscribe(([backend]) => {
      this.backend = backend;
    });
  }

  private static get singleResourceHeader() {
    return new HttpHeaders({
      Accept: 'application/vnd.pgrst.object+json', // returns a single item, vs Array
    });
  }

  private static convertTimestampsToUTC(reminder: Reminder) {
    // Angular forms return text only data, the API server requires a date in UTC
    reminder.due = new Date(new Date(reminder.due).toISOString());
  }

  getAll(): Observable<Reminder[]> {
    return this.http
      .get<Reminder[]>(this.backend.remindersSortURL());
  }

  create(reminder: Reminder) {
    console.log('BEFORE:', reminder);
    ReminderService.convertTimestampsToUTC(reminder);
    console.log('AFTER:', reminder);

    return this.http
      .post<Reminder>(this.backend.remindersURL(), reminder);
  }

  get(id: number) {
    return this.http
      .get<Reminder>(this.backend.reminderURL(id), {headers: ReminderService.singleResourceHeader});
  }

  update(id: number, reminder: Reminder) {
    ReminderService.convertTimestampsToUTC(reminder);

    const rem = {...reminder};
    delete rem.id; // Always ensure I strip away the id field
    return this.http
      .patch(this.backend.reminderURL(id), rem, {headers: ReminderService.singleResourceHeader});
  }

  deleteMany(ids: number[]) {
    return this.http
      .delete(this.backend.remindersURL(ids));
  }
}
