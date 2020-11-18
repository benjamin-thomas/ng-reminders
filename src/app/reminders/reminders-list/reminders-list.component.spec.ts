import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RemindersListComponent} from './reminders-list.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {Reminder} from '../reminder.model';
import {of} from 'rxjs';
import {PaginatedRemindersResponse, ReminderService} from '../services/reminder.service';
import {AutoSizeInputModule} from 'ngx-autosize-input';
import {FormsModule} from '@angular/forms';

const fakeReminders = [
  new Reminder(
    'This is a bogus reminder 1',
    new Date()),
  new Reminder(
    'This is a bogus reminder 2',
    new Date()),
];

const fakeReminderResponse: PaginatedRemindersResponse = {
  items: fakeReminders,
  total: fakeReminders.length
};

class FakeReminderService {
  getAll() {
    return of(fakeReminderResponse);
  }
}

describe('RemindersListComponent', () => {
  let component: RemindersListComponent;
  let fixture: ComponentFixture<RemindersListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        AutoSizeInputModule,
        FormsModule,
      ],
      declarations: [RemindersListComponent],
      providers: [
        ReminderService, {provide: ReminderService, useClass: FakeReminderService}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(RemindersListComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
