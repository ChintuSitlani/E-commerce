import { Component } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CommonModule } from '@angular/common';
import { NgbCarousel, NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { Product, userLoginData } from '../data-type';
import { MatCardModule } from '@angular/material/card';
import { MatButtonModule } from '@angular/material/button';
import { CartService } from '../cart.service';

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
  priceInclTax: GLfloat = 0;

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
    this.router.navigate(['/product-card'], { queryParams: { id: product._id } });
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
      this.cartService.setCartCount(this.cartCount);
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
    return ((this.priceInclTax - discountedAmt) / this.priceInclTax) * 100;
  }

}

