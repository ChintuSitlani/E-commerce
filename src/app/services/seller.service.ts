import { HttpClient, HttpHeaders, HttpParams } from '@angular/common/http';
import { buyers, sellers, userSignupData } from '../data-type';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject, Observable } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';
import { environment } from '../../environments/environment';
import { sellerLocalStorageData } from '../data-type';

@Injectable({
  providedIn: 'root',
})
export class SellerService {

  isSellerLoggedIn = new BehaviorSubject<boolean>(false);
  private baseUrl = environment.apiUrl; // already ends in /api

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    if (isPlatformBrowser(this.platformId)) {
      const sellerData = this.getSellerData();
      if (sellerData) {
        this.isSellerLoggedIn.next(true);
      }
    }
  }

  sellerSignup(data: userSignupData) {
    const url = `${this.baseUrl}/seller/signup`;

    return this.http
      .post(url, data, { observe: 'response' })
      .subscribe(
        (result) => {
          this.isSellerLoggedIn.next(true);
          if (typeof window !== 'undefined') {
            localStorage.setItem('seller', JSON.stringify(result.body));
          }
          this.router.navigate(['seller-home']);
        },
        (error) => {
          console.error('Signup failed:', error);
          return error;
        }
      );
  }

  sellerLogin(data: buyers) {
    const body = {
      email: data.email,
      password: data.password
    };

    const headers = new HttpHeaders({ 'Content-Type': 'application/json' });

    const url = `${this.baseUrl}/seller/login`;

    return this.http
      .post(url, body, { headers, observe: 'response' })
      .subscribe(
        (result: any) => {
          if (result.body) {
            this.isSellerLoggedIn.next(true);
            if (typeof window !== 'undefined') {
              localStorage.setItem('seller', JSON.stringify(result.body));
            }
            this.router.navigate(['seller-home']);
          } else {
            alert('Login failed: Invalid credentials.');
          }
        },
        (error) => {
          console.error('Login failed:', error);
          alert('Login failed: Server error.');
        }
      );
  }

  reloadSeller() {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('seller')) {
        this.isSellerLoggedIn.next(true);
      }
    }
  }
  setSellerData(data: sellerLocalStorageData) {
    if (typeof window !== 'undefined') {
      localStorage.setItem('seller', JSON.stringify(data));
    }
  }
  getSellerData: () => sellerLocalStorageData | null = () => {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('seller')) {
        return JSON.parse(localStorage.getItem('seller') || '{}');
      } else {
        return null;
      }
    }
  };
  getSellerDataSellerDataType(): sellers {
    const data = this.getSellerData();
    return data && data.seller ? data.seller : {
      _id: '',
      email: '',
      password: ''
    };
  }
  isSellerAuthenticated() {
    const sellerData = localStorage.getItem('seller');
    this.isSellerLoggedIn.next(!!sellerData);
  }

  sellerLogout() {
    localStorage.removeItem('seller');
    this.isSellerAuthenticated();
    this.router.navigate(['/sellerLogin']);
  }
  updateSellerInfo(seller: sellers): Observable<sellers> {
    if (seller) {
      const headers = new HttpHeaders({
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${SellerService.getToken()}`
      });
      return this.http.put<sellers>(`${this.baseUrl}/seller/update/${seller._id}`, seller, { headers });
    }
    return new Observable<sellers>((observer) => {
      observer.error('Invalid buyer data');
    });
  }
  static getToken(): string {
    const seller = JSON.parse(localStorage.getItem('seller') || '{}');
    return seller.token || '';
  }
}
