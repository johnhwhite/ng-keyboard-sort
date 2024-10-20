import { TestBed } from '@angular/core/testing';

import { KeyboardSortListService } from './keyboard-sort-list.service';

describe('KeyboardSortListService', () => {
  let service: KeyboardSortListService<string[]>;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeyboardSortListService],
    });
    service = TestBed.inject(KeyboardSortListService<string[]>);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
