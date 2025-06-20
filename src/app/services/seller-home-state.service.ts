import { Injectable } from '@angular/core';
import { Product } from '../data-type';

@Injectable({
  providedIn: 'root'
})
export class SellerHomeStateService {
  products: Product[] = [];
  currentPage = 1;
  hasMoreProducts = true;
}