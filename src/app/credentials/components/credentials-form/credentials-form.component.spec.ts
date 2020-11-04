import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {CredentialsFormComponent} from './credentials-form.component';
import {ReactiveFormsModule} from '@angular/forms';

describe('CredentialsFormComponent', () => {
  let component: CredentialsFormComponent;
  let fixture: ComponentFixture<CredentialsFormComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [
        ReactiveFormsModule
      ],
      declarations: [ CredentialsFormComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(CredentialsFormComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
