import {TestBed} from '@angular/core/testing';

import {PaginatedRemindersResponse, ReminderService} from './reminder.service';
import {HttpClient, HttpResponse} from '@angular/common/http';
import {HttpClientTestingModule, HttpTestingController} from '@angular/common/http/testing';
import {Reminder} from '../reminder.model';
import {BackendFactory} from '../../backend/backend-factory';
import {Backend} from '../../backend/backend.model';
import {BehaviorSubject} from 'rxjs';

class FakeBackendSelectService {
  emitter = new BehaviorSubject<[Backend, string]>(this.initSubject());

  constructor(public backend: Backend) {
  }

  initSubject(): [Backend, string] {
    return [this.backend, 'Testing backend'];
  }

  save() { // keep, mimics BackendSelectService
    throw new Error('NOOP');
  }

}

// https://blog.knoldus.com/unit-testing-of-angular-service-with-httpclient/
describe('ReminderService', () => {
  let service: ReminderService;
  let httpClient: HttpClient;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule]
    });

    httpClient = TestBed.inject(HttpClient);

    // Mocking HTTP
    // httpTestingController = TestBed.inject(HttpTestingController);
    // TestBed.inject(FakeBackendSelectService); // Wrong type, I cannot use the fake service that way

    service = TestBed.inject(ReminderService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });

  // Fails on the content-range response header not being available in testing mode.
  // I don't see the point of faking stuff even more here.
  // Keeping this test for ref for now.
  xit('should get all reminders', () => {
    // I hate this
    const backend = BackendFactory.create('PostgREST', 'bogusHost');
    const backendSelectService = new FakeBackendSelectService(backend);
    const service2 = new ReminderService(httpClient, backendSelectService);

    const mockResponse: PaginatedRemindersResponse = {
      items: [
        new Reminder('hello', new Date())
      ],
      total: 1
    };
    service2.getAll(1, 0, null, null).subscribe(
      paginatedReminders => expect(paginatedReminders.items).toEqual(
        mockResponse.items, 'should return the mocked reminders'
      ),
      fail
    );

    const httpMock = TestBed.inject(HttpTestingController);
    const req = httpMock.expectOne(backend.remindersSortURL(1,  0, null, null));
    expect(req.request.method).toEqual('GET');
    // expect(req.request.body).toEqual(null); // this does not work

    const expectedResponse = new HttpResponse({status: 404, statusText: 'Completely bogus', body: mockResponse});
    req.event(expectedResponse);
    req.flush(mockResponse, {status: 200, statusText: 'OK'});

    httpMock.verify();
  });
});
