import { Injectable } from '@angular/core';
import { environment } from '../../environments/environments';
import { HttpClient } from '@angular/common/http';
import { userData } from '../data-type';
import { throwError } from 'rxjs/internal/observable/throwError';

@Injectable({
  providedIn: 'root'
})
export class BuyerService {

  private baseUrl = environment.apiUrl;
  constructor(private http: HttpClient) { }

  buyerSignup(data: userData, param: string) {
    if (param !== '') {
      return this.http.post(`${this.baseUrl}/${param}`, data);
    }
    return throwError(() => new Error('parameter is empty'));
  }
}
