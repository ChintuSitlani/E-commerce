import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';
import { MatSnackBar } from '@angular/material/snack-bar';
import { ProductService } from '../services/product.service';
import { Product, buyerLocalStorageData } from '../data-type';
import { ActivatedRoute } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { LayoutModule } from '@angular/cdk/layout';
import { Router } from '@angular/router';
import { CartService } from '../cart.service';

@Component({
  selector: 'app-search-results',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatCardModule,
    FormsModule,
    MatCheckboxModule,
    MatExpansionModule,
    LayoutModule
  ],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.css'
})
export class SearchResultsComponent implements OnInit {
  allProducts: Product[] = [];
  totalCount = 0;
  currentSkip = 0;
  limit = 10;
  loading = false;
  priceInclTax: number = 0;
  searchTerm = '';
  buyerData: buyerLocalStorageData;
  filters: { brand: string; minPrice: number; maxPrice: number } = {
    brand: '',
    minPrice: 0,
    maxPrice: 1000000
  };

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router,
    private snackBar: MatSnackBar,
    private cartService: CartService
  ) {
    this.buyerData = JSON.parse(localStorage.getItem('buyer') || '{}') as buyerLocalStorageData;
  }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['q'] || '';
      this.resetAndLoadProducts();
    });
  }

  // Reset state and load first set of products
  resetAndLoadProducts(): void {
    this.allProducts = [];
    this.currentSkip = 0;
    this.totalCount = 0;
    this.loadMoreProducts();
  }


  loadMoreProducts(): void {
    this.loading = true;

    const filtersToSend = { ...this.filters };

    this.productService.getResultProducts(
      this.searchTerm,
      filtersToSend,
      this.currentSkip,
      this.limit
    ).subscribe(response => {

      this.allProducts = [...this.allProducts, ...response.products];
      this.totalCount = response.total;
      this.currentSkip += this.limit;
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  // Reapply filters and reload from start
  applyFilters(): void {
    this.resetAndLoadProducts();
  }
  viewProductDetail(product?: Product): void {
    if (product) {
      this.router.navigate(['/product-detail'], {
        queryParams: { id: product._id },
        state: { product }
      });
    }
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
    this.productService.addToCart(payload).subscribe({
      next: (res) => {
        this.snackBar.open('Added to cart!', 'Close', { duration: 2000 });
        this.productService.getCartItems(this.buyerData?.buyer?._id).subscribe(items => {
          this.cartService.setCartCount(items.length);
        });
      },
      error: (err) => {
        this.snackBar.open('Error adding to cart.', 'Close', { duration: 2000 });
        console.error('Error adding to cart:', err);
      }
    });
  }
  getSellingPriceInclTax(priceExclTax: number, taxRate: number): number {
    const taxAmount = (priceExclTax * taxRate) / 100;
    this.priceInclTax = parseFloat((priceExclTax + taxAmount).toFixed(2));
    return this.priceInclTax;
  }
  getDiscountedPrice(priceExclTax: number, taxRate: number, discountAmt: number): number {
    this.priceInclTax = this.getSellingPriceInclTax(priceExclTax, taxRate);
    return parseFloat((this.priceInclTax - discountAmt).toFixed(2));
  }
  getDiscountPercentage(discountedAmt: number): number {
    return parseFloat(((discountedAmt / this.priceInclTax) * 100).toFixed(2));
  }
}