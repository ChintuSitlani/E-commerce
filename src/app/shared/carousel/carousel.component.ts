import { CommonModule } from '@angular/common';
import { Component, Output, EventEmitter } from '@angular/core';
import { NgbCarousel, NgbCarouselModule } from '@ng-bootstrap/ng-bootstrap';
import { BuyerHomeStateService } from '../../services/buyer-home-state.service';
import { ProductService } from '../../services/product.service';

@Component({
  selector: 'app-carousel',
  imports: [
    NgbCarousel,
    NgbCarouselModule,
    CommonModule
  ],
  templateUrl: './carousel.component.html',
  styleUrls: ['./carousel.component.css']
})
export class CarouselComponent {
  productsCarousel: any[] = [];
  @Output() veiwCarouselProduct = new EventEmitter<any>();
  
  private images = [
    "assets/images/carouselImages/crauselimage2.png",
    "assets/images/carouselImages/crauselimage3.png",
    "assets/images/carouselImages/crauselimage1.webp",
  ];

  constructor(
    private productService: ProductService,
    private stateService: BuyerHomeStateService,
  ) { }

  ngOnInit() {
    if (this.stateService.productsCarousel.length > 0) {
      this.productsCarousel = this.stateService.productsCarousel;
    } else {
      this.productService.getProductForCarousel(1).subscribe(data => {
        // Add backend products
        this.productsCarousel = data;

        // Add local image products
        const localProducts = this.getLocalCarouselItems(3);
        this.productsCarousel = [...localProducts, ...this.productsCarousel];

        // Cache it
        this.stateService.productsCarousel = this.productsCarousel;
      });
    }
  }

  viewProduct(product: any) {
    if(product._id) {
      this.veiwCarouselProduct.emit(product);
    }
  }

  // Helper: Create carousel items with local images
  private getLocalCarouselItems(count: number): any[] {
    const localItems: any[] = [];
    
    // Use available images, repeat if needed
    for (let i = 0; i < count; i++) {
      const imageIndex = i % this.images.length;
      const imageUrl = this.images[imageIndex];
      
      localItems.push({
        name: `Featured Product ${i + 1}`,
        description: 'Discover amazing deals and offers on our featured products.',
        imageUrl: imageUrl
      });
    }
    return localItems;
  }

  // Method to handle image loading errors
  handleImageError(event: any, product: any) {
    console.warn(`Failed to load image: ${product.imageUrl}`);
    
    // Fallback to next available local image
    const fallbackImages = this.images.filter(img => img !== product.imageUrl);
    if (fallbackImages.length > 0) {
      const fallbackImage = fallbackImages[0];
      event.target.src = fallbackImage;
    } else {
      // Ultimate fallback - you can add a default image in your assets
      event.target.src = 'assets/images/default-product.png';
    }
  }
}