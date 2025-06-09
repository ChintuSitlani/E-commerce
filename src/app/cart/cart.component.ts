import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CartService } from '../cart.service';
import { CommonModule } from '@angular/common';
import { CartItems, buyerLocalStorageData } from '../data-type';
import { MatIconModule } from '@angular/material/icon';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { MatDividerModule } from '@angular/material/divider';
import { RouterModule } from '@angular/router';
import { CartSummary } from '../data-type';
import { FormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { Router } from '@angular/router';
import { MatSnackBar } from '@angular/material/snack-bar'; // Add this import

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
    MatInputModule,
    MatCheckboxModule
  ],
  templateUrl: './cart.component.html',
  styleUrls: ['./cart.component.css']
})
export class CartComponent implements OnInit {
  cartItems: CartItems[] = [];
  buyerData: buyerLocalStorageData = JSON.parse(localStorage.getItem('buyer') || '{}');
  couponCode = '';
  summary: CartSummary = {
    subTotal: 0,
    itemDiscountTotal: 0,
    couponDiscount: 0,
    taxTotal: 0,
    total: 0,
    cartItems: []
  };
  selectAll: boolean = false;


  constructor(
    private productService: ProductService,
    private cartService: CartService,
    private router: Router,
    private snackBar: MatSnackBar // Inject MatSnackBar
  ) { }

  ngOnInit(): void {
    this.loadCart();

  }



  loadCart() {
    this.productService.getCartItems(this.buyerData.buyer._id).subscribe(items => {
      this.cartItems = items.map(item => ({ ...item, selected: true }));
      this.cartService.setCartCount(items.length);
    });
    this.applyCoupon();
  }

  updateQuantity(item: CartItems, newQty: number) {
    if (newQty === 0)
      return this.removeItem(item._id);
    if (newQty < 0)
      return;

      item.quantity = newQty;
      this.productService.updateCartItem(item._id, item).subscribe(() => {
      item.quantity = newQty;
      this.applyCoupon();
    });
  }

  removeItem(itemId: string) {
    const snackBarRef = this.snackBar.open('Are you sure you want to remove this item?', 'Yes', { duration: 3200 });
    snackBarRef.onAction().subscribe(() => {
      this.productService.removeFromCart(itemId).subscribe(() => {
        this.cartItems = this.cartItems.filter(i => i._id !== itemId);
        this.applyCoupon();
        this.cartService.setCartCount(this.cartItems.length);
        this.snackBar.open('Item removed from cart', 'Close', { duration: 2000 });
      });
    });
  }

  checkout() {
    const selectedItems = this.cartItems.filter(item => item.selected);
    if (selectedItems.length === 0) {
      this.snackBar.open('Please select at least one item to checkout.', 'Close', { duration: 2500 });
      return;
    }

    // Send selectedItems to checkout/order page or backend
    console.log('Proceeding with:', selectedItems);

    // Example: store selected items in localStorage
    localStorage.setItem('checkoutItems', JSON.stringify(selectedItems));

    // Navigate to checkout page
    this.router.navigate(['/checkout']);
  }

  applyCoupon() {
    this.productService.getCartSummary(this.buyerData.buyer._id, this.couponCode).subscribe((summary: CartSummary) => {
      this.summary = summary;
      this.cartItems = summary?.cartItems || [];
    });
  }

  getFinalPrice(priceExclTax: number, taxRate: number, disAmt: number): number {
    return parseFloat((this.getPriceAfterTax(priceExclTax, taxRate) - disAmt).toFixed(2));
  }
  getPriceAfterTax(priceExclTax: number, taxRate: number): number {
    return priceExclTax + (priceExclTax * taxRate / 100);
  }
  getDiscountPercentage(priceExclTax: number, taxRate: number, discountAmt: number): number {
    return parseFloat((discountAmt / this.getPriceAfterTax(priceExclTax, taxRate) * 100).toFixed(2));
  }
  toggleSelectAll() {
    this.cartItems.forEach(item => {
      item.selected = this.selectAll;
      this.productService.updateCartItemSelection(item._id, this.selectAll).subscribe();
    });
  }
  toggleSelection(item: CartItems) {
    this.productService.updateCartItemSelection(item._id, item.selected ?? false).subscribe();
  }
}
