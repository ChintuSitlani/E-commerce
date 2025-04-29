import { Component } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CommonModule } from '@angular/common';
import { NgbCarousel, NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Product } from '../data-type';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';

@Component({
  selector: 'app-buyer-home',
  imports: [
    NgbCarousel,
    NgbCarouselModule,
    CommonModule,
    NgbCarouselModule,
    FormsModule,
    MatCardModule,
    MatButtonModule
  ],
  templateUrl: './buyer-home.component.html',
  styleUrl: './buyer-home.component.css'
})
export class BuyerHomeComponent {
  products: any[] = [];
  productsCarousel: any[] = [];
  constructor(
    private productService: ProductService,
    private router: Router,
  ) {

  }
  ngOnInit() {
    this.productService.getProductForCarousel(3).subscribe(data => {
      this.productsCarousel = data;
    });
    this.fetchProducts();
  }

  fetchProducts() {
    this.productService.getProducts().subscribe((res: Product[]) => {
      this.products = res;
    });
  }
  viewProduct(product: any) {
    this.router.navigate(['/product-card', product._id]);
  }

  addToCart(productId: string) {
    
  }
}

