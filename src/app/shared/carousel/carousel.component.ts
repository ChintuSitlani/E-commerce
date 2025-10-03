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
    "https://www.shutterstock.com/image-vector/online-shopping-concept-perfect-landing-260nw-1654537690.jpg",
    "https://t4.ftcdn.net/jpg/02/49/50/15/360_F_249501541_XmWdfAfUbWAvGxBwAM0ba2aYT36ntlpH.jpg",
  ]
  constructor(
    private productService: ProductService,
    private stateService: BuyerHomeStateService,
  ) { }

  ngOnInit() {
    if (this.stateService.productsCarousel.length > 0) {
      this.productsCarousel = this.stateService.productsCarousel;
    } else {
      this.productService.getProductForCarousel(2).subscribe(data => {
        // Add backend products
        this.productsCarousel = data;

        // Add random internet products
        const randomProducts = this.getRandomCarouselItems(2);
        this.productsCarousel = [...randomProducts, ...this.productsCarousel];

        // Cache it
        this.stateService.productsCarousel = this.productsCarousel;
      });
    }
  }

  viewProduct(product: any) {
  if(product._id)
      this.veiwCarouselProduct.emit(product);
  }

  // 🔥 Helper: Create random products for carousel
  private getRandomCarouselItems(count: number): any[] {
    const randomItems: any[] = [];
    for (let i = 0; i < count; i++) {
      randomItems.push({
        name: "",
        description: 'This is a randomly generated product description for demo purposes.',
        imageUrl : this.images[i]
      });
    }
    return randomItems;
  }
}
