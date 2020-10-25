import { async, ComponentFixture, TestBed } from '@angular/core/testing';

import { BackendStatusComponent } from './backend-status.component';

describe('BackendStatusComponent', () => {
  let component: BackendStatusComponent;
  let fixture: ComponentFixture<BackendStatusComponent>;

  beforeEach(async(() => {
    TestBed.configureTestingModule({
      declarations: [ BackendStatusComponent ]
    })
    .compileComponents();
  }));

  beforeEach(() => {
    fixture = TestBed.createComponent(BackendStatusComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
