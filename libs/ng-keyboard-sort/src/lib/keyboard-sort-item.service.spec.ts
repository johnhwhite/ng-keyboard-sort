import { TestBed } from '@angular/core/testing';

import { KeyboardSortItemService } from './keyboard-sort-item.service';
import { KeyboardSortListService } from './keyboard-sort-list.service';

describe('KeyboardSortItemService', () => {
  let service: KeyboardSortItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeyboardSortItemService, KeyboardSortListService],
    });
    service = TestBed.inject(KeyboardSortItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
