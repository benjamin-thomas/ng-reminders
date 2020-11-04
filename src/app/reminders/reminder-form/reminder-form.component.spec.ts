import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {ReminderFormComponent} from './reminder-form.component';
import {FormControl, FormGroup, ReactiveFormsModule} from '@angular/forms';

describe('ReminderFormComponent', () => {
  let component: ReminderFormComponent;
  let fixture: ComponentFixture<ReminderFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule, // removes console warnings
      ],
      declarations: [ReminderFormComponent]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(ReminderFormComponent);
    component = fixture.componentInstance;

    component.form = new FormGroup({ // removes console warnings
      due: new FormControl(''),
      content: new FormControl(''),
    });
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
