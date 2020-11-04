import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BackendSelectComponent } from './backend-select.component';
import {RouterTestingModule} from '@angular/router/testing';

describe('BackendSelectComponent', () => {
  let component: BackendSelectComponent;
  let fixture: ComponentFixture<BackendSelectComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      imports: [RouterTestingModule],
      declarations: [ BackendSelectComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackendSelectComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
