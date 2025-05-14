import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { SellerService } from '../services/seller.service';
import { Router } from '@angular/router';
import { Product, userLoginData } from '../data-type';
import { CommonModule } from '@angular/common';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';


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
    private sellerService: SellerService
  ) {}

  ngOnInit(): void {
    this.fetchSellerProducts();
  }

  fetchSellerProducts() {
    const sellerData = this.sellerService.getSellerData();
    if (sellerData != null && sellerData != undefined && sellerData.email != null && sellerData.email != undefined && sellerData._id != null && sellerData._id != undefined) {
      this.productService.getSellerProducts(sellerData._id, sellerData.email).subscribe((res: Product[]) => {
        this.sellerProducts = res;
      });
    }else
      console.error('Seller data is not available. Please log in again.');
  }

  editProduct(product: any) {
    this.router.navigate(['/product-card'], { queryParams: { id: product._id } });
  }

  deleteProduct(productId: string) {
    this.productService.deleteProduct(productId).subscribe(() => {
      this.fetchSellerProducts(); 
    });
  }
  getSellingPriceInclTax(priceExclTax: number, taxRate: number): number {
    const taxAmount = (priceExclTax * taxRate) / 100;
    this.priceInclTax =  parseFloat((priceExclTax + taxAmount).toFixed(2));
    return this.priceInclTax;
  }
  getDiscountedPrice(discountAmt: number): number {
    return parseFloat((this.priceInclTax - discountAmt).toFixed(2));
  }
  getDiscountPercentage( discountedAmt: number): number {
    return parseFloat((((discountedAmt) / this.priceInclTax) * 100).toFixed(2));
  }
}