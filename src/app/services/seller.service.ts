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

  sellerSignup(data: userSignupData, param: string) {
    if (param !== '') {
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
    } else {
      return throwError(() => new Error('parameter is empty')); // Ensures function always returns a value
    }
  }
  sellerLogin(data: userLoginData, param: string) {
    if (param !== '') {
      const redirectRoute = param + '-home';
      return this.http
        .get(`${this.baseUrl}/${param}`, { observe: 'response' })
        .subscribe(
          (result) => {
            this.isSellerLoggedIn.next(true);
            console.log(result.body);
            if (typeof window !== 'undefined') {
              localStorage.setItem(param, JSON.stringify(result.body));
            }
  
            this.router.navigate([redirectRoute]);
          },
          (error) => {
            console.error('Signup failed:', error);
            return error; // Ensures function always returns a value
          }
        );
    } else {
      return throwError(() => new Error('parameter is empty')); // Ensures function always returns a value
    }
  }

  reloadSeller(param: string) {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem(param)) {
        this.isSellerLoggedIn.next(true);
      }
    }
  }
  getSellerData: () => userLoginData | null = () => {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem('seller')) {
        return JSON.parse(localStorage.getItem('seller') || '{}')[0];
      } else {
        return null;
      }
    }
  }
}
function throwError(arg0: () => Error) {
  throw new Error('Function not implemented.');
}

