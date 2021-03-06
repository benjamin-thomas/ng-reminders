import {Injectable} from '@angular/core';
import {HttpClient} from '@angular/common/http';
import {Reminder} from '../reminder.model';
import {Observable} from 'rxjs';
import {BackendSelectService} from '../../backend/backend-select/service/backend-select.service';
import {Backend} from '../../backend/backend.model';


export interface PaginatedRemindersResponse {
  total: number;
  items: Reminder[];
}

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

  getAll(page: number, perPage: number, searchContentLike: string, isDue: boolean): Observable<PaginatedRemindersResponse> {
    const url = this.backend.remindersSortURL(page, perPage, searchContentLike, isDue);

    return this.http
      .get<PaginatedRemindersResponse>(url);
  }

  create(reminder: Reminder) {
    return this.http
      .post<Reminder>(this.backend.remindersURL(), reminder);
  }

  get(id: number) {
    return this.http
      .get<Reminder>(this.backend.reminderURL(id));
  }

  update(id: number, reminder: Reminder) {
    const rem = {...reminder};
    delete rem.id; // Always ensure I strip away the id field
    return this.http
      .patch(this.backend.reminderURL(id), rem);
  }

  pushBack(id: number, dueString: string) {
    return this.http
      .patch(this.backend.reminderURL(id), {due: dueString});
  }

  deleteMany(ids: number[]) {
    return this.http
      .delete(this.backend.remindersURL(ids));
  }
}
