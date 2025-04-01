import {  CanActivateFn } from '@angular/router';
import { inject } from '@angular/core';
import { Router } from '@angular/router';
import { SellerService } from './services/seller.service';
import { BuyerService } from './services/buyer.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authSellerService = inject(SellerService);
  const authBuyerService = inject (BuyerService);
  const router = inject(Router);
  //const param = route.paramMap.get('user')||'';
 // console.log(param);
    if (localStorage.getItem('buyer') || authBuyerService.isBuyerLoggedIn.value){
      authBuyerService.isBuyerLoggedIn.next(true);
      return true;
    }
    else if(localStorage.getItem('seller')|| authSellerService.isSellerLoggedIn.value ){
      authSellerService.isSellerLoggedIn.next(true);
      return true;// Allow access
    }
    else return false;
};
