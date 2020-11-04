import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ReminderEditComponent} from './reminder-edit.component';
import {RouterTestingModule} from '@angular/router/testing';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {ReminderService} from '../services/reminder.service';
import {of} from 'rxjs';
import {Reminder} from '../reminder.model';
import {ReminderFormComponent} from '../reminder-form/reminder-form.component';
import {FormControl, ReactiveFormsModule} from '@angular/forms';

const fakeReminder = new Reminder(
  'This is a bogus reminder',
  new Date()
);

class FakeReminderService {
  get() {
    return of(fakeReminder);
  }
}

describe('ReminderEditComponent', () => {
  let component: ReminderEditComponent;
  let fixture: ComponentFixture<ReminderEditComponent>;
  let contentCtrl: FormControl;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        HttpClientTestingModule,
        RouterTestingModule,
        ReactiveFormsModule,
      ],
      declarations: [ReminderEditComponent, ReminderFormComponent],
      providers: [
        ReminderService, {provide: ReminderService, useClass: FakeReminderService}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReminderEditComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
    contentCtrl = component.form.controls.content as FormControl;
  });


  it('should return a fake reminder', () => {
    expect(component).toBeTruthy();

    expect(
      contentCtrl.value
    ).toEqual(fakeReminder.content);

    expect(component.form.valid).toEqual(true);

    // For ref
    // const compiled = fixture.debugElement.nativeElement;
    // console.log('COMPILED', compiled.querySelector('form').innerHTML);
  });

  it('should require the content to be set', () => {
    contentCtrl.setValue('');
    expect(component.form.valid).toBeFalse();
    expect(contentCtrl.errors.required).toBeTrue();

    contentCtrl.setValue('Do this at 8 PM');
    expect(component.form.valid).toBeTrue();
  });

});
