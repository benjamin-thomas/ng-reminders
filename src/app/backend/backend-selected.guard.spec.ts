import { TestBed } from '@angular/core/testing';

import { BackendSelectedGuard } from './backend-selected.guard';
import {RouterTestingModule} from '@angular/router/testing';

describe('BackendSelectedGuard', () => {
  let guard: BackendSelectedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [
        RouterTestingModule
      ]
    });
    guard = TestBed.inject(BackendSelectedGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
