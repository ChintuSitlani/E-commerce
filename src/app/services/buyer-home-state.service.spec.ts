import { TestBed } from '@angular/core/testing';

import { BuyerHomeStateService } from './buyer-home-state.service';

describe('BuyerHomeStateService', () => {
  let service: BuyerHomeStateService;

  beforeEach(() => {
    TestBed.configureTestingModule({});
    service = TestBed.inject(BuyerHomeStateService);
  });

  it('should be created', () => {
    expect(service).toBeTruthy();
  });
});
