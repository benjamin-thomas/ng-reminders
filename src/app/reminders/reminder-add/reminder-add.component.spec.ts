import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { ReminderAddComponent } from './reminder-add.component';
import {HttpClientModule} from '@angular/common/http';
import {RouterTestingModule} from '@angular/router/testing';
import {ReminderFormComponent} from '../reminder-form/reminder-form.component';
import {ReactiveFormsModule} from '@angular/forms';

describe('ReminderAddComponent', () => {
  let component: ReminderAddComponent;
  let fixture: ComponentFixture<ReminderAddComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [
        ReminderAddComponent,
        ReminderFormComponent
      ],
      imports: [HttpClientModule, RouterTestingModule, ReactiveFormsModule]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReminderAddComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
