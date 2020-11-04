import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {RemindersListComponent} from './reminders-list.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {RouterTestingModule} from '@angular/router/testing';
import {Reminder} from '../reminder.model';
import {of} from 'rxjs';
import {ReminderService} from '../services/reminder.service';

const fakeReminders = [
  new Reminder(
    'This is a bogus reminder 1',
    new Date()),
  new Reminder(
    'This is a bogus reminder 2',
    new Date()),
];

class FakeReminderService {
  getAll() {
    return of(fakeReminders);
  }
}

describe('RemindersListComponent', () => {
  let component: RemindersListComponent;
  let fixture: ComponentFixture<RemindersListComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, RouterTestingModule],
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
