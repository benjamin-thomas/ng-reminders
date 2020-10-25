import { TestBed } from '@angular/core/testing';

import { BackendSelectedGuard } from './backend-selected.guard';

describe('BackendSelectedGuard', () => {
  let guard: BackendSelectedGuard;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    guard = TestBed.inject(BackendSelectedGuard);
  });

  it('should be created', () => {
    expect(guard).toBeTruthy();
  });
});
