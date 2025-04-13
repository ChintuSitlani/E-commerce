import { Component } from '@angular/core';
import { Router } from '@angular/router';
import { SellerService } from '../services/seller.service';
import { BuyerService } from '../services/buyer.service';

@Component({
  selector: 'app-home',
  imports: [],
  templateUrl: './home.component.html',
  styleUrl: './home.component.css'
})
export class HomeComponent {
  constructor(
    private router: Router,
    private sellerService: SellerService,
    private buyerService: BuyerService,
  ) {}
  ngOnInit() {
    let redirectRoute = '';
    if(this.sellerService.isSellerLoggedIn.value === true) 
      redirectRoute =  'seller-home';
    else if(this.buyerService.isBuyerLoggedIn.value === true)
      redirectRoute = 'buyer-home';
  this.router.navigate([redirectRoute]);
  }

}
