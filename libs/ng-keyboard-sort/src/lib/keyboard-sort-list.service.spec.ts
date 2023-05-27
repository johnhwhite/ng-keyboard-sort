import { TestBed } from '@angular/core/testing';

import { KeyboardSortListService } from './keyboard-sort-list.service';

describe('KeyboardSortListService', () => {
  let service: KeyboardSortListService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeyboardSortListService],
    });
    service = TestBed.inject(KeyboardSortListService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
