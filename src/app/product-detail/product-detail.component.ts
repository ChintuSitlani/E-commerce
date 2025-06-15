import { Component, OnInit } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { CartItems, Product, buyerLocalStorageData } from '../data-type';
import { ProductService } from '../services/product.service';
import { catchError, of } from 'rxjs';
import { FormsModule } from '@angular/forms';
import { MatCardModule } from '@angular/material/card';
import { MatIconModule } from '@angular/material/icon';
import { CartService } from '../cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CommonModule } from '@angular/common';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-product-detail',
  imports: [
    MatCardModule,
    CommonModule,
    MatIconModule,
    FormsModule,
    MatButtonModule,
  ],
  standalone: true,
  templateUrl: './product-detail.component.html',
  styleUrls: ['./product-detail.component.css']
})
export class ProductDetailComponent implements OnInit {
  product: Product | null = null;
  productId: string = '';
  errorMessage: string = '';
  selectedImage: string = '';
  quantity = 1;
  buyerData: buyerLocalStorageData;
  cartCount = 0;
  cartItems: CartItems[] = [];
  priceInclTax: number = 0;
  isLoading = false;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private cartService: CartService,
    private snackBar: MatSnackBar
  ) {
    this.buyerData = JSON.parse(localStorage.getItem('buyer') || '{}') as buyerLocalStorageData;
  }

  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.productId = params.get('id') || '';
      if (this.productId) {
        this.loadProduct();
      }
    });

    this.loadCartItems();
  }

  loadProduct() {
    this.isLoading = true;
    this.productService.getProductById(this.productId)
      .pipe(
        catchError(error => {
          console.error('Product not found or server error:', error);
          this.errorMessage = 'Product not found.';
          this.router.navigate(['/page-not-found']);
          return of(null);
        })
      )
      .subscribe(res => {
        this.isLoading = false;
        if (res) {
          this.product = res;
          this.selectedImage = res.imageUrl;
          this.priceInclTax = this.getSellingPriceInclTax(res.priceExclTax, res.taxRate);
        }
      });
  }

  async loadCartItems(): Promise<void> {
    if (!this.buyerData?.buyer?._id) return;

    return new Promise((resolve) => {
      this.productService.getCartItems(this.buyerData?.buyer?._id).subscribe(items => {
        this.cartItems = items.map(item => ({ ...item, selected: true }));
        this.cartCount = items.length;
        this.cartService.setCartCount(this.cartCount);
        resolve();
      });
    });
  }

  async addToCart(product: Product): Promise<boolean> {
    if (!this.buyerData || !this.buyerData?.buyer?._id) {
      this.snackBar.open('Please login to add to cart.', 'Close', { duration: 3000 });
      return false;
    }

    const cartItem: any = {
      productId: product._id,
      userId: this.buyerData?.buyer?._id,
      quantity: this.quantity,
      selected: true,
      taxRate: product.taxRate,
      discountAmt: product.discountAmt || 0,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
      _id: '',
      __v: 0
    };

    this.isLoading = true;
    try {
      // First add the item to cart
      await this.productService.addToCart(cartItem).toPromise();
      this.snackBar.open('Added to cart!', 'Close', { duration: 2000 });

      // Then refresh the cart items
      await this.loadCartItems();

      return true;
    } catch (err: any) {
      const message = err?.error?.message || 'Error adding to cart.';
      this.snackBar.open(message, 'Close', { duration: 3000 });
      return false;
    } finally {
      this.isLoading = false;
    }
  }

  async buyNow(product: Product) {
    // Wait for addToCart to complete
    const addedSuccessfully = await this.addToCart(product);
    if (!addedSuccessfully) return;

    // Now get fresh cart items
    const selectedItems = this.cartItems.filter(item => item.selected);


    if (selectedItems.length === 0) {
      this.snackBar.open('Please select at least one item to checkout.', 'Close', { duration: 3000 });
      return;
    }

    // Store and navigate
    localStorage.setItem('checkoutItems', JSON.stringify(selectedItems));
    this.router.navigate(['/checkout']);
  }

  getSellingPriceInclTax(priceExclTax: number, taxRate: number): number {
    const taxAmount = (priceExclTax * taxRate) / 100;
    return parseFloat((priceExclTax + taxAmount).toFixed(2));
  }

  getDiscountedPrice(discountAmt: number): number {
    return parseFloat((this.priceInclTax - discountAmt).toFixed(2));
  }

  getDiscountPercentage(discountedAmt: number): number {
    return parseFloat(((discountedAmt / this.priceInclTax) * 100).toFixed(2));
  }

  isInCart(product: Product): boolean {
    return !!this.findCartItemId(product);
  }

  removeFromCart(product: Product) {
    const cartItemId = this.findCartItemId(product);
    if (cartItemId !== null) {
      this.isLoading = true;
      this.productService.removeFromCart(cartItemId).subscribe({
        next: (res) => {
          this.snackBar.open('Removed from cart!', 'Close', { duration: 2000 });
          this.cartItems = this.cartItems.filter(i => i._id !== cartItemId);
          this.cartCount = this.cartItems.length;
          this.cartService.setCartCount(this.cartCount);
          this.isLoading = false;
        },
        error: (err) => {
          this.snackBar.open('Error removing item from cart.', 'Close', { duration: 2000 });
          console.error('Error removing from cart:', err);
          this.isLoading = false;
        }
      });
    }
  }

  findCartItemId(product: Product): string | null {
    if (!product || !this.cartItems.length) return null;
    const cartItem = this.cartItems.find(item => item.productId._id === product._id);
    return cartItem ? cartItem._id : null;
  }
}