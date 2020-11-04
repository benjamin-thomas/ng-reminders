import {async, ComponentFixture, TestBed} from '@angular/core/testing';

import {SignupComponent} from './signup.component';
import {HttpClientTestingModule} from '@angular/common/http/testing';
import {AuthService} from '../../services/auth.service';
import {CredentialsFormComponent} from '../credentials-form/credentials-form.component';
import {ReactiveFormsModule} from '@angular/forms';

class FakeAuthService {
  signup(email: string, password: string): void {
    console.log('NOOP', email, password);
  }
}

describe('SignupComponent', () => {
  let component: SignupComponent;
  let fixture: ComponentFixture<SignupComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [HttpClientTestingModule, ReactiveFormsModule],
      declarations: [SignupComponent, CredentialsFormComponent],
      providers: [
        AuthService, {provide: AuthService, useClass: FakeAuthService}
      ]
    })
      .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(SignupComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
