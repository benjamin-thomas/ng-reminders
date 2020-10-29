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
    this.backendSelectService.emitter.subscribe(backend => {
      console.log('Catching backend emit:', backend);
      this.backend = backend;
    });
  }

  private static get singleResourceHeader() {
    return new HttpHeaders({
      Accept: 'application/vnd.pgrst.object+json', // returns a single item, vs Array
    });
  }

  getAll(): Observable<Reminder[]> {
    return this.http
      .get<Reminder[]>(this.backend.remindersURL() + '?order=due.asc,id.desc');
  }

  create(reminder: Reminder) {
    return this.http
      .post<Reminder>(this.backend.remindersURL(), reminder);
  }

  get(id: number) {
    return this.http
      .get<Reminder>(this.backend.reminderURL(id), {headers: ReminderService.singleResourceHeader});
  }

  update(id: number, reminder: Reminder) {
    return this.http
      .patch<Reminder>(this.backend.reminderURL(id), reminder, {headers: ReminderService.singleResourceHeader});
  }
}
