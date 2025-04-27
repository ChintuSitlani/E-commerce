import { HttpClient } from '@angular/common/http';
import { userLoginData, userSignupData } from '../data-type';
import { environment } from '../../environments/environments';
import { Injectable, Inject, PLATFORM_ID } from '@angular/core';
import { BehaviorSubject } from 'rxjs';
import { isPlatformBrowser } from '@angular/common';
import { Router } from '@angular/router';


@Injectable({
  providedIn: 'root',
})
export class SellerService {
  isSellerLoggedIn = new BehaviorSubject<boolean>(false);
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object
  ) {
    // Check local storage only if running in the browser
    if (isPlatformBrowser(this.platformId)) {
      const sellerData = localStorage.getItem('seller');
      if (sellerData) {
        this.isSellerLoggedIn.next(true);
      }
    }
  }

  sellerSignup(data: userSignupData) {
    const param = 'seller';
    const redirectRoute = param + '-home';
    return this.http
      .post(`${this.baseUrl}/${param}`, data, { observe: 'response' })
      .subscribe(
        (result) => {
          this.isSellerLoggedIn.next(true);

          if (typeof window !== 'undefined') {
            localStorage.setItem(param, JSON.stringify(result.body));
          }

          this.router.navigate([redirectRoute]);
          console.log(result);
        },
        (error) => {
          console.error('Signup failed:', error);
          return error; // Ensures function always returns a value
        }
      );
  }
  
  sellerLogin(data: userLoginData) {
    return this.http
      .get<userLoginData[]>(`${this.baseUrl}/seller?email=${data.email}&password=${data.password}`)
      .subscribe(
        (result) => {
          if (result.length) {
            // Seller found - login successful
            this.isSellerLoggedIn.next(true);
            if (typeof window !== 'undefined') {
              localStorage.setItem('seller', JSON.stringify(result[0]));
            }
            this.router.navigate(['seller-home']);
          } else {
            // No seller found with given email/password
            alert('Login failed: Invalid email or password.');
          }
        },
        (error) => {
          console.error('Login failed:', error);
          alert('Login failed: Server error.');
        }
      );
  }
  reloadSeller() {
    const param = 'seller';
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem(param)) {
        this.isSellerLoggedIn.next(true);
      }
    }
  }
  getSellerData: () => userLoginData | null = () => {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('seller')) {
        return JSON.parse(localStorage.getItem('seller') || '{}');
      } else {
        return null;
      }
    }
  }
  isSellerAuthenticated() {
    const sellerData = localStorage.getItem('seller');
    if (sellerData) {
      this.isSellerLoggedIn.next(true);
    } else {
      this.isSellerLoggedIn.next(false);
    }
  }
  sellerLogout() {
      localStorage.removeItem('seller');
      this.isSellerAuthenticated();
      this.router.navigate(['']);
  }
}

