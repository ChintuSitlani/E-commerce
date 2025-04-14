import { CanActivateFn } from '@angular/router';
import { inject, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { SellerService } from './services/seller.service';
import { BuyerService } from './services/buyer.service';

export const AuthGuard: CanActivateFn = (route, state) => {
  const authSellerService = inject(SellerService);
  const authBuyerService = inject(BuyerService);
  const router = inject(Router);
  const platformId = inject(PLATFORM_ID);

  if (isPlatformBrowser(platformId)) {

    const isBuyer = localStorage.getItem('buyer') || authBuyerService.isBuyerLoggedIn.value;
    const isSeller = localStorage.getItem('seller') || authSellerService.isSellerLoggedIn.value;

    if (isBuyer) {
      authBuyerService.isBuyerLoggedIn.next(true);
      return true;
    } else if (isSeller) {
      authSellerService.isSellerLoggedIn.next(true);
      return true;
    }
  }
  return false;
};
