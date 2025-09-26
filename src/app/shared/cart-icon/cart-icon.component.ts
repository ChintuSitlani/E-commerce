import { Component, OnInit, OnDestroy, Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink } from '@angular/router';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { Subscription } from 'rxjs';

import { CartService } from '../../cart.service';
import { BuyerService } from '../../services/buyer.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-cart-icon',
  standalone: true,
  imports: [CommonModule, RouterLink, MatIconModule, MatButtonModule],
  templateUrl: './cart-icon.component.html',
  styleUrls: ['./cart-icon.component.css']
})
export class CartIconComponent implements OnInit, OnDestroy {
  @Input() size: 'small' | 'medium' | 'large' = 'medium';
  cartItems = 0;
  private previousCartCount = 0;
  private subscriptions: Subscription[] = [];

  constructor(
    private cartService: CartService,
    private buyerService: BuyerService,
    private productService: ProductService
  ) { }

  ngOnInit(): void {
    // Subscribe to cart count
    this.subscriptions.push(
      this.cartService.getCartCount().subscribe(count => {
        this.previousCartCount = this.cartItems;
        this.cartItems = count;
      })
    );

    // Update cart count if buyer logged in
    const buyerId = this.buyerService.getBuyerData()?.buyer?._id;
    if (buyerId) {
      this.productService.getCartItems(buyerId)
        .subscribe(items => this.cartService.setCartCount(items.length));
    }
  }

  ngOnDestroy(): void {
    this.subscriptions.forEach(sub => sub.unsubscribe());
  }
}