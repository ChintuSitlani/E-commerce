import { TestBed } from '@angular/core/testing';

import { SellerHomeStateService } from './seller-home-state.service';

describe('SellerHomeStateService', () => {
  let service: SellerHomeStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(SellerHomeStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
