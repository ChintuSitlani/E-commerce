import { ComponentFixture, TestBed } from '@angular/core/testing';

import { SellerAddProdComponent } from './seller-add-prod.component';

describe('SellerAddProdComponent', () => {
  let component: SellerAddProdComponent;
  let fixture: ComponentFixture<SellerAddProdComponent>;

  beforeEach(async () => {
    await TestBed.configureTestingModule({
      imports: [SellerAddProdComponent]
    })
    .compileComponents();

    fixture = TestBed.createComponent(SellerAddProdComponent);
    component = fixture.componentInstance;
    fixture.detectChanges();
  });

  it('should create', () => {
    expect(component).toBeTruthy();
  });
});
