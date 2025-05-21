import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CartService } from '../cart.service';
import { CommonModule } from '@angular/common';
import { buyers, CartItems } from '../data-type';
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
  cartItems: CartItems[] = [];
  userData :  buyers =  JSON.parse(localStorage.getItem('buyer') || '{}');
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

 

  loadCart() {
    this.productService.getCartItems(this.userData._id).subscribe(items => {
      this.cartItems = items;
      this.cartService.setCartCount(items.length);
    });
    this.applyCoupon();
  }

  updateQuantity(item: any, newQty: number) {
    if (newQty < 1) return;
    this.productService.updateCartQuantity(item._id, newQty).subscribe(() => {
      item.quantity = newQty;
      this.applyCoupon();
    });
  }

  removeItem(itemId: string) {
    this.productService.removeFromCart(itemId).subscribe(() => {
      this.cartItems = this.cartItems.filter(i => i._id !== itemId);
      this.applyCoupon();
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
  
  getFinalPrice(priceExclTax: number, taxRate: number, disAmt:number): number {
    return parseFloat((this.getPriceAfterTax(priceExclTax,taxRate)-disAmt).toFixed(2));
  }
  getPriceAfterTax(priceExclTax: number, taxRate: number): number {
    return priceExclTax + (priceExclTax * taxRate / 100);
  }
  getDiscountPercentage(priceExclTax: number, taxRate: number, discountAmt: number): number {
    return parseFloat((discountAmt / this.getPriceAfterTax(priceExclTax,taxRate) * 100).toFixed(2));
  }
}
