import { TestBed } from '@angular/core/testing';

import { KeyboardSortItemService } from './keyboard-sort-item.service';

describe('KeyboardSortItemService', () => {
  let service: KeyboardSortItemService;

  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [KeyboardSortItemService],
    });
    service = TestBed.inject(KeyboardSortItemService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
