import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { userData } from '../data-type';
import { environment } from '../../environments/environments';
import { throwError } from 'rxjs/internal/observable/throwError';

@Injectable({
  providedIn: 'root'
})
export class SellerService {

  private baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  sellerSignup(data: userData, param: string) {
    if (param !== '') {
      return this.http.post(`${this.baseUrl}/${param}`, data);
    }
    return throwError(() => new Error('parameter is empty'));
  }
}
