import { Component, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatToolbarModule } from '@angular/material/toolbar';
import { MatButtonModule } from '@angular/material/button';
import { MatMenuModule } from '@angular/material/menu';
import { MatIconModule } from '@angular/material/icon';
import { Subject, Subscription } from 'rxjs';

import { SellerService } from '../services/seller.service';
import { BuyerService } from '../services/buyer.service';
import { ProductService } from '../services/product.service';
import { CartService } from '../cart.service';
import { Product } from '../data-type';

import { SearchBarComponent } from '../shared/search-bar/search-bar.component';
import { CartIconComponent } from '../shared/cart-icon/cart-icon.component';

const MATERIAL_MODULES = [
  MatToolbarModule, MatButtonModule, MatIconModule, MatMenuModule
];

@Component({
  selector: 'app-navbar',
  standalone: true,
  imports: [CommonModule, RouterLink, SearchBarComponent, CartIconComponent, ...MATERIAL_MODULES],
  templateUrl: './navbar.component.html',
  styleUrls: ['./navbar.component.css']
})
export class NavbarComponent implements OnInit, OnDestroy {
  private destroy$ = new Subject<void>();
  private subscriptions: Subscription[] = [];

  isSellerLogin = false;
  isBuyerLogin = false;
  cartItems = 0;
  userEmail = '';

  constructor(
    private cartService: CartService,
    private sellerService: SellerService,
    private buyerService: BuyerService,
    private productService: ProductService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    const buyerData = this.buyerService.getBuyerData();
    this.userEmail = buyerData?.buyer?.email || '';
  }

  ngOnInit(): void {
    this.subscriptions.push(
      this.sellerService.isSellerLoggedIn.subscribe(status => this.isSellerLogin = status)
    );
    this.subscriptions.push(
      this.buyerService.isBuyerLoggedIn.subscribe(status => {
        this.isBuyerLogin = status;
        if (status) this.updateCartCount();
      })
    );
    this.subscriptions.push(
      this.cartService.getCartCount().subscribe(count => this.cartItems = count)
    );
  }

  ngOnDestroy(): void {
    this.destroy$.next();
    this.destroy$.complete();
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }

  logout(): void {
    if (!this.isSellerLogin && !this.isBuyerLogin) {
      this.snackBar.open('No user is currently logged in.', 'Close', { duration: 2500 });
      return;
    }
    if (confirm('Are you sure you want to logout?')) {
      this.isSellerLogin ? this.sellerService.sellerLogout() : this.buyerService.buyerLogout();
    }
  }

  updateCartCount(): void {
    const buyerId = this.buyerService.getBuyerData()?.buyer?._id;
    if (!buyerId) return;
    this.productService.getCartItems(buyerId)
      .subscribe(items => this.cartService.setCartCount(items.length));
  }

  goToMyAccount(): void { this.router.navigate(['/my-account']); }
  goToMyOrders(): void { this.router.navigate(['/orders']); }

  handleSearchResult(product: Product | string): void {
    if (typeof product === 'string') {
      this.router.navigate(['/search-results'], { queryParams: { q: product } });
    } else {
      this.router.navigate(['/product-detail'], { queryParams: { id: product._id } });
    }
  }
}