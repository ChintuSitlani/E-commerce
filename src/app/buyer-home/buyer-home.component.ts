import { Component } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CommonModule } from '@angular/common';
import { NgbCarousel, NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Product, userLoginData } from '../data-type';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { HeaderComponent } from '../header/header.component'; // optional if using shared service
import { CartService } from '../cart.service';
import { BuyerService } from '../services/buyer.service';

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

  cartCount = 0;
  buyerData: userLoginData;
  products: any[] = [];
  productsCarousel: any[] = [];
  constructor(
    private productService: ProductService,
    private router: Router,
    private cartService: CartService
  ) {
    this.buyerData = JSON.parse(localStorage.getItem('buyer') || '{}') as userLoginData;
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
    this.productService.addToCart(productId, this.buyerData._id).subscribe({
      next: (res) => {
        console.log('Added to cart', res);
        this.updateCartCount();
      },
      error: (err) => console.error('Error adding to cart:', err)
    });
  }
  updateCartCount() {
    this.productService.getCartItems(this.buyerData._id).subscribe(items => {
      this.cartCount = items.length;
      this.cartService.setCartCount(this.cartCount); // if shared service
    });
  }
}

