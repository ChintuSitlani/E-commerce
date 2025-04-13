import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Product } from '../data-type';
import { Observable } from 'rxjs';

@Injectable({
  providedIn: 'root'
})
export class ProductService {

  private baseUrl = 'http://localhost:3000';

  constructor(private http: HttpClient) {}

  addProduct(product: Product): Observable<Product> {
    return this.http.post<Product>(`${this.baseUrl}/product`, product);
  }
  getSellerProducts(sellerId: string, sellerEmail: string): Observable<Product[]> {
    const params = { selleremail: sellerEmail, sellerId };
    console.log('🔍 Requesting products from:', this.baseUrl + '/product'+params);
    console.log('param ', params);
    return this.http.get<Product[]>(`${this.baseUrl}/product`, { params });
  }
  deleteProduct(productId: string) {
    return this.http.delete(`${this.baseUrl}/product/${productId}`);
  }
}
