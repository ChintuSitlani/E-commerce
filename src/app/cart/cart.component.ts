import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CartService } from '../cart.service';
import { CommonModule } from '@angular/common';
import { userLoginData } from '../data-type';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { CartSummary } from '../data-type'; 
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    RouterModule,
    FormsModule,
    MatFormFieldModule,
    MatInputModule
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  userData :  userLoginData =  JSON.parse(localStorage.getItem('buyer') || '{}');
  totalPrice: number = 0;
  couponCode = '';
  summary: CartSummary = {
    subTotal: 0,
    itemDiscountTotal: 0,
    couponDiscount: 0,
    taxTotal: 0,
    total: 0,
    cartItems: []
  };
  constructor(
    private productService: ProductService,
    private cartService: CartService
  ) { }

  ngOnInit(): void {
    this.loadCart();
  }

  calculateTotal() {
    this.totalPrice = this.cartItems.reduce((sum, item) => {
      return sum + item.quantity * item.productId.price;
    }, 0);
  }

  loadCart() {
    this.productService.getCartItems(this.userData._id).subscribe(items => {
      this.cartItems = items;
      this.calculateTotal();
      this.cartService.setCartCount(items.length);
    });
    this.applyCoupon();
  }

  updateQuantity(item: any, newQty: number) {
    if (newQty < 1) return;
    this.productService.updateCartQuantity(item._id, newQty).subscribe(() => {
      item.quantity = newQty;
      this.applyCoupon();
      this.calculateTotal();
    });
  }

  removeItem(itemId: string) {
    this.productService.removeFromCart(itemId).subscribe(() => {
      this.cartItems = this.cartItems.filter(i => i._id !== itemId);
      this.applyCoupon();
      this.calculateTotal();
      this.cartService.setCartCount(this.cartItems.length);
    });
  }
  checkout() {
    // Placeholder logic for now
    alert('Order placed successfully!');
  }
  
  applyCoupon() {
    this.productService.getCartSummary(this.userData._id, this.couponCode).subscribe((summary: CartSummary) => {
      this.summary = summary;
      this.cartItems = summary?.cartItems || [];
    });
  }
  getDiscountedPrice(price: number, discountRate: number): number {
    return Math.round(price - (price * discountRate / 100));
  }
}
