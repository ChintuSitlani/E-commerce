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

  saveProduct(product: Product): Observable<Product> {
    if (product.id) {
      return this.http.put<Product>(`${this.baseUrl}/products/${product.id}`, product);
    } else {
      return this.http.post<Product>(`${this.baseUrl}/products`, product);
    }
  }
  getSellerProducts(sellerId: string, sellerEmail: string): Observable<Product[]> {
    const params = { selleremail: sellerEmail, sellerId };
    return this.http.get<Product[]>(`${this.baseUrl}/products`, { params });
  }
  getProductById(id: string): Observable<Product> {
    return this.http.get<Product>(`${this.baseUrl}/products/${id}`);
  }
  deleteProduct(productId: string) {
    return this.http.delete(`${this.baseUrl}/products/${productId}`);
  }
  getProductForCarousel(limit: number): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products?_limit=${limit}`);
  }
  getProducts(): Observable<Product[]> {
    return this.http.get<Product[]>(`${this.baseUrl}/products`);
  }

}
