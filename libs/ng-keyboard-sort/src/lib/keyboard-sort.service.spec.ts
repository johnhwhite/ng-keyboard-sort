import { TestBed } from '@angular/core/testing';

import { KeyboardSortService } from './keyboard-sort.service';

describe('KeyboardSortService', () => {
  let service: KeyboardSortService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeyboardSortService],
    });
    service = TestBed.inject(KeyboardSortService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
