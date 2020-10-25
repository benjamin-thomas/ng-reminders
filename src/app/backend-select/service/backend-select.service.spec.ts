import { TestBed } from '@angular/core/testing';

import { BackendSelectService } from './backend-select.service';

describe('BackendSelectService', () => {
  let service: BackendSelectService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BackendSelectService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
