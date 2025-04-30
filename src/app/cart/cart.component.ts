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

@Component({
  selector: 'app-cart',
  standalone: true,
  imports: [
    CommonModule,
    MatIconModule,
    MatButtonModule,
    MatCardModule,
    MatDividerModule,
    RouterModule
  ],
  templateUrl: './cart.component.html',
})
export class CartComponent implements OnInit {
  cartItems: any[] = [];
  userData :  userLoginData =  JSON.parse(localStorage.getItem('buyer') || '{}');
  totalPrice: number = 0;

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
  }

  updateQuantity(item: any, newQty: number) {
    if (newQty < 1) return;
    this.productService.updateCartQuantity(item._id, newQty).subscribe(() => {
      item.quantity = newQty;
      this.calculateTotal();
    });
  }

  removeItem(itemId: string) {
    this.productService.removeFromCart(itemId).subscribe(() => {
      this.cartItems = this.cartItems.filter(i => i._id !== itemId);
      this.calculateTotal();
      this.cartService.setCartCount(this.cartItems.length);
    });
  }
  checkout() {
    // Placeholder logic for now
    alert('Order placed successfully!');
    // Optionally, send a request to create an order and clear the cart
  }
}
