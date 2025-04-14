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
    if (sellerData != null) {
      this.productService.getSellerProducts(sellerData.id, sellerData.email).subscribe((res: Product[]) => {
        this.sellerProducts = res;
      });
    }
  }

  editProduct(product: any) {
    this.router.navigate(['/product-card', product.id]);
  }

  deleteProduct(productId: string) {
    this.productService.deleteProduct(productId).subscribe(() => {
      this.fetchSellerProducts(); // Refresh the list
    });
  }
}