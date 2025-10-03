import { Component } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Product, buyers, CartItems, buyerLocalStorageData } from '../data-type';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CartService } from '../cart.service';
import { MatSnackBar } from '@angular/material/snack-bar';
import { BuyerHomeStateService } from '../services/buyer-home-state.service';
import { CarouselComponent } from '../shared/carousel/carousel.component';
@Component({
  selector: 'app-buyer-home',
  imports: [
    CommonModule,
    FormsModule,
    MatCardModule,
    MatButtonModule,
    CarouselComponent
  ],
  templateUrl: './buyer-home.component.html',
  styleUrl: './buyer-home.component.css'
})
export class BuyerHomeComponent {
  cartCount = 0;
  buyerData: buyerLocalStorageData;
  products: Product[] = [];
  
  priceInclTax: GLfloat = 0;
  currentPage = 1;
  itemsPerPage = 6;
  hasMoreProducts = true;
  isLoading = false;

  constructor(
    private productService: ProductService,
    private router: Router,
    private cartService: CartService,
    private snackBar: MatSnackBar,
    private stateService: BuyerHomeStateService,
  ) {
    this.buyerData = JSON.parse(localStorage.getItem('buyer') || '{}') as buyerLocalStorageData;
  }

  ngOnInit() {

    if (this.stateService.products.length > 0) {
      this.products =this.stateService.products;
      this.currentPage = this.stateService.currentPage;
      this.hasMoreProducts = this.stateService.hasMoreProducts;
    }else {
      this.fetchProducts();
    }
    this.updateCartCount();
  }

  fetchProducts() {
    this.isLoading = true;
    this.productService.getProducts(this.currentPage, this.itemsPerPage).subscribe({
      next: (res: any) => {
        if (this.currentPage === 1) {
          this.products = res.products;
        } else {
          this.products = [...this.products, ...res.products];
        }
        // Update the state service with the fetched products
        this.stateService.products = this.products;
        this.stateService.currentPage = this.currentPage;
        this.stateService.hasMoreProducts = res.hasMore;

        this.hasMoreProducts = res.hasMore;
        this.isLoading = false;
      },
      error: (err) => {
        this.snackBar.open('Error fetching products. '+ err, 'Close', { duration: 2200 });
        console.error('Error fetching products:', err);
        this.isLoading = false;
      }
    });
  }

  loadMore() {
    if (this.hasMoreProducts && !this.isLoading) {
      this.currentPage++;
      this.fetchProducts();
    }
  }

  viewProduct(product: any) {
    this.router.navigate(['/product-detail'], { 
      queryParams: { id: product._id },
      state: { product }
     });
  }
  addToCart(product: Product) {
    if (!this.buyerData || !this.buyerData?.buyer?._id) {
      this.snackBar.open('Please login to add to cart.', 'Close', { duration: 3000 });
      return;
    }

    const payload = {
      productId: product._id,
      userId: this.buyerData?.buyer?._id,
      quantity: 1
    };

    console.log('Sending to cart API:', payload);

    this.productService.addToCart(payload).subscribe({
      next: (res) => {
        this.snackBar.open('Added to cart!', 'Close', { duration: 2000 });
        this.updateCartCount();
      },
      error: (err) => {
        this.snackBar.open('Error adding to cart.', 'Close', { duration: 2000 });
        console.error('Error adding to cart:', err);
      }
    });
  }
  updateCartCount() {
    this.productService.getCartItems(this.buyerData?.buyer?._id).subscribe(items => {
      this.cartCount = items.length;
      this.cartService.setCartCount(this.cartCount);
    });
  }
  getSellingPriceInclTax(priceExclTax: number, taxRate: number): number {
    const taxAmount = (priceExclTax * taxRate) / 100;
    this.priceInclTax = parseFloat((priceExclTax + taxAmount).toFixed(2));
    return this.priceInclTax;
  }
  getDiscountedPrice(discountAmt: number): number {
    return parseFloat((this.priceInclTax - discountAmt).toFixed(2));
  }
  getDiscountPercentage(discountedAmt: number): number {
    return parseFloat(((discountedAmt / this.priceInclTax) * 100).toFixed(2));
  }

}

