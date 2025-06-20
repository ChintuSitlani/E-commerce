import { Injectable } from '@angular/core';
import { Product } from '../data-type';

@Injectable({
  providedIn: 'root'
})
export class BuyerHomeStateService {
  products: Product[] = [];
  productsCarousel: Product[] = [];
  currentPage = 1;
  hasMoreProducts = true;
}