import {Injectable} from '@angular/core';
import {HttpClient, HttpHeaders, HttpResponse} from '@angular/common/http';
import {Reminder} from '../reminder.model';
import {Observable} from 'rxjs';
import {BackendSelectService} from '../../backend/backend-select/service/backend-select.service';
import {Backend} from '../../backend/backend.model';
import {map} from 'rxjs/operators';


export interface PaginatedRemindersResponse {
  items: Reminder[];
  total: number;
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

  private static get singleResourceHeader() {
    return new HttpHeaders({
      Accept: 'application/vnd.pgrst.object+json', // returns a single item, vs Array
    });
  }

  getAll(limit: number, offset: number, searchContentLike: string, isDue: boolean): Observable<PaginatedRemindersResponse> {
    const url = 'https://api-proxy.reminders.test/reminders?'; // this.backend.remindersSortURL(limit, offset, searchContentLike, isDue);

    return this.http
      .get<Reminder[]>(url, {
        observe: 'response', // access response headers
        headers: {Prefer: 'count=exact'} // get total (rather than `*`)
      })
      .pipe(
        map((res: HttpResponse<Reminder[]>) => {
          const contentRange = res.headers.get('content-range');
          /*
          contentRange: "0-101/*" --> without any specific count headers
          "content-range" => "0-101/102", --> with header 'Prefer': 'count=exact'
          "content-range" => "4-5/*", --> without header 'Prefer': 'count=exact'
          "content-range" => "4-5/102"
           */
          const [currSlice, totalStr] = contentRange.split('/');
          const total = Number(totalStr);
          console.log({contentRange, currSlice, total});

          return {
            items: res.body,
            total,
          };
        })
      );
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
    const rem = {...reminder};
    delete rem.id; // Always ensure I strip away the id field
    return this.http
      .patch(this.backend.reminderURL(id), rem, {headers: ReminderService.singleResourceHeader});
  }

  pushBack(id: number, dueString: string) {
    return this.http
      .patch(this.backend.reminderURL(id), { due: dueString}, {headers: ReminderService.singleResourceHeader});
  }

  deleteMany(ids: number[]) {
    return this.http
      .delete(this.backend.remindersURL(ids));
  }
}
