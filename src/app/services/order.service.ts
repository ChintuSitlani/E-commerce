import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { OrderSummary } from '../data-type';
import { Observable } from 'rxjs';
import { HttpClient } from '@angular/common/http';
import { HttpParams } from '@angular/common/http';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = environment.apiUrl;
  endpoint = {
    order: 'order',
    buyerOrders: 'order/buyer',
    sellerOrders: 'order/seller',
  }
  constructor(
    private http: HttpClient,
    
  ) { }

  saveOrder(orderS: OrderSummary): Observable<OrderSummary> {
    if (orderS._id) {
      return this.http.put<OrderSummary>(`${this.baseUrl}/${this.endpoint.order}/${orderS._id}`, orderS);
    } else {
      return this.http.post<OrderSummary>(`${this.baseUrl}/${this.endpoint.order}`, orderS);
    }
  }
  getOrdersForBuyer(
    buyerId: string,
    filters: { status?: string, startDate?: string, endDate?: string, page?: number, limit?: number } = {}
  ): Observable<any> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<OrderSummary[]>(`${this.baseUrl}/${this.endpoint.buyerOrders}/${buyerId}`, { params });
  }

  getOrdersForSeller(
    sellerId: string,
    filters: { status?: string, startDate?: string, endDate?: string, page?: number, limit?: number } = {}
  ): Observable<any> {
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<OrderSummary[]>(`${this.baseUrl}/${this.endpoint.sellerOrders}/${sellerId}`, { params });
  }
}
