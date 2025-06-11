import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { SellerService } from '../services/seller.service';
import { Router } from '@angular/router';
import { Product, buyers } from '../data-type';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { MatSnackBar } from '@angular/material/snack-bar';


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
  sellerProducts: any[] = [];
  priceInclTax: GLfloat = 0;

  constructor(
    private productService: ProductService,
    private router: Router,
    private sellerService: SellerService,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit(): void {
    this.fetchSellerProducts();
  }

  fetchSellerProducts() {
    const sellerData = this.sellerService.getSellerData();
    if (sellerData?.seller?.email && sellerData?.seller?._id && sellerData?.token) {
      const token = sellerData.token;
      this.productService.getSellerProducts(sellerData?.seller?._id, sellerData?.seller?.email)
        .subscribe(
          (res: Product[]) => {
            this.sellerProducts = res;
          },
          (error) => {
            console.error('Failed to fetch products:', error);
          }
        );
    } else {
      console.error('Seller data is not available. Please log in again.');
    }
  }

  editProduct(product: any) {
    this.router.navigate(['/product-card'], { queryParams: { id: product._id } });
  }

  deleteProduct(productId: string) {

    const confirmDelete = confirm('Are you sure you want to delete this product?');
    if (confirmDelete) {
      this.productService.deleteProduct(productId).subscribe({
        next: () => {
          this.snackBar.open('Product deleted successfully!', 'Close', { duration: 3000 });
          this.fetchSellerProducts();
        },
        error: () => this.snackBar.open('Failed to delete product.', 'Close', { duration: 3000 })
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
    return parseFloat((((discountedAmt) / this.priceInclTax) * 100).toFixed(2));
  }
}