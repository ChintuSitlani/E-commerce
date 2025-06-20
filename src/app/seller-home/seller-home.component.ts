import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { SellerService } from '../services/seller.service';
import { Router } from '@angular/router';
import { Product, buyers } from '../data-type';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';
import { SellerHomeStateService } from '../services/seller-home-state.service';

@Component({
  selector: 'app-seller-home',
  imports: [
    CommonModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './seller-home.component.html',
  styleUrl: './seller-home.component.css'
})
export class SellerHomeComponent implements OnInit {
  sellerProducts: Product[] = [];
  priceInclTax: number = 0;

  currentPage = 1;
  itemsPerPage = 6;
  hasMoreProducts = true;
  isLoading = false;

  constructor(
    private productService: ProductService,
    private router: Router,
    private sellerService: SellerService,
    private snackBar: MatSnackBar,
    private stateService: SellerHomeStateService
  ) { }

  ngOnInit(): void {
   if (this.stateService.products.length > 0) {
      this.sellerProducts =this.stateService.products;
      this.currentPage = this.stateService.currentPage;
      this.hasMoreProducts = this.stateService.hasMoreProducts;
    }else {
       this.fetchSellerProducts();
    }
  }

  fetchSellerProducts() {
    const sellerData = this.sellerService.getSellerData();
    if (sellerData?.seller?.email && sellerData?.seller?._id) {
      this.isLoading = true;
      this.productService.getSellerProducts(
        sellerData?.seller?._id,
        sellerData?.seller?.email,
        this.currentPage,
        this.itemsPerPage
      ).subscribe({
        next: (res: any) => {
          if (this.currentPage === 1) {
            this.sellerProducts = res.products;
          } else {
            this.sellerProducts = [...this.sellerProducts, ...res.products];
          }

          this.stateService.products = this.sellerProducts;
          this.stateService.currentPage = this.currentPage; 
          this.stateService.hasMoreProducts = res.hasMore;

          this.hasMoreProducts = res.hasMore;
          this.isLoading = false;
        },
        error: (error) => {
          console.error('Failed to fetch products:', error);
          this.snackBar.open('Error fetching products.', 'Close', { duration: 2500 });
          this.isLoading = false;
        }
      });
    } else {
      console.error('Seller data is not available. Please log in again.');
    }
  }

  loadMore() {
    if (this.hasMoreProducts && !this.isLoading) {
      this.currentPage++;
      this.fetchSellerProducts();
    }
  }

  editProduct(product: Product) {
    this.router.navigate(['/product-card'], {
      queryParams: { id: product._id },
      state: { product, isEditMode: true }
    });
  }

  deleteProduct(productId: string) {
    const confirmDelete = confirm('Are you sure you want to delete this product?');
    if (confirmDelete) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.snackBar.open('Product deleted successfully!', 'Close', { duration: 3000 });
          this.currentPage = 1;
          this.fetchSellerProducts();
        },
        error: () => {
          this.snackBar.open('Failed to delete product.', 'Close', { duration: 3000 });
        }
      });
    }
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