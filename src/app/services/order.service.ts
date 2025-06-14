import { Injectable } from '@angular/core';
import { environment } from '../../environments/environment';
import { OrderSummary } from '../data-type';
import { Observable } from 'rxjs';
import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { SellerService } from './seller.service';
import { BuyerService } from './buyer.service';

@Injectable({
  providedIn: 'root'
})
export class OrderService {
  private baseUrl = environment.apiUrl;
  private token: string;
  endpoint = {
    order: 'order',
    buyerOrders: 'order/buyer',
    sellerOrders: 'order/seller',
  }
  constructor(private http: HttpClient) {
    const buyerToken = BuyerService.getToken();
    const sellerToken = SellerService.getToken();
    this.token = buyerToken || sellerToken || '';
  }


  saveOrder(orderS: OrderSummary): Observable<OrderSummary> {
    if (!this.token) {
      throw new Error('No token found. Please log in as a buyer.');
    }

    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
    if (orderS._id) {
      return this.http.put<OrderSummary>(`${this.baseUrl}/${this.endpoint.order}/${orderS._id}`, orderS, { headers });
    } else {
      return this.http.post<OrderSummary>(`${this.baseUrl}/${this.endpoint.order}`, orderS, { headers });
    }
  }
  getOrdersForBuyer(
    buyerId: string,
    filters: { status?: string, startDate?: string, endDate?: string, page?: number, limit?: number } = {}
  ): Observable<any> {
    let token = BuyerService.getToken();
    if (!token) {
      throw new Error('No token found. Please log in as a buyer.');
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`
    });
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<OrderSummary[]>(`${this.baseUrl}/${this.endpoint.buyerOrders}/${buyerId}`, { params, headers });
  }

  getOrdersForSeller(
    sellerId: string,
    filters: { status?: string, startDate?: string, endDate?: string, page?: number, limit?: number } = {}
  ): Observable<any> {
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
    let params = new HttpParams();
    Object.entries(filters).forEach(([key, value]) => {
      if (value !== undefined && value !== null) {
        params = params.set(key, value.toString());
      }
    });

    return this.http.get<OrderSummary[]>(`${this.baseUrl}/${this.endpoint.sellerOrders}/${sellerId}`, { params, headers });
  }

  changeOrderStatus(orderId: string, varStatus: string): Observable<OrderSummary> {
    if (!this.token) {
      throw new Error('No token found. Please log in as a seller.');
    }
    const headers = new HttpHeaders({
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${this.token}`
    });
    const body = {
      status: varStatus,
    };
    return this.http.put<OrderSummary>(`${this.baseUrl}/${this.endpoint.order}/${orderId}`, body, { headers });
  }
}
