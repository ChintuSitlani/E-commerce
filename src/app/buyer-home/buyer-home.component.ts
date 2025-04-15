import { Component, ViewChild } from '@angular/core';
import { ProductService } from '../services/product.service';
import { CommonModule } from '@angular/common';
import { NgbCarousel, NgbCarouselModule, NgbSlideEvent, NgbSlideEventSource } from '@ng-bootstrap/ng-bootstrap';
import { FormsModule } from '@angular/forms';

@Component({
  selector: 'app-buyer-home',
  imports: [
    NgbCarousel,
    NgbCarouselModule,
    CommonModule,
    NgbCarouselModule,
     FormsModule
  ],
  templateUrl: './buyer-home.component.html',
  styleUrl: './buyer-home.component.css'
})
export class BuyerHomeComponent {
  products : any[] = [];

  constructor(private productService: ProductService){
    
  }
  ngOnInit(){
    this.productService.getProductForCarousel(3).subscribe(data => {
      this.products = data;
      console.log('products',this.products);
    });
  }
}
