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
export class BuyerService {
  isBuyerLoggedIn = new BehaviorSubject<boolean>(false);
  private baseUrl = environment.apiUrl;

  constructor(
    private http: HttpClient,
    private router: Router,
    @Inject(PLATFORM_ID) private platformId: Object // Injecting platform ID
  ) {
    // Check local storage only if running in the browser
    if (isPlatformBrowser(this.platformId)) {
      const buyerData = localStorage.getItem('buyer');
      if (buyerData) {
        this.isBuyerLoggedIn.next(true);
      }
    }
  }

  buyerSignup(data: userSignupData, param: string) {
    if (param !== '') {
      const redirectRoute = param + '-home';
      return this.http
        .post(`${this.baseUrl}/${param}`, data, { observe: 'response' })
        .subscribe(
          (result) => {
            this.isBuyerLoggedIn.next(true);
  
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
  buyerlogin(data: userLoginData, param: string) {
    if (param !== '') {
      const redirectRoute = param + '-home';
      return this.http
        .get(`${this.baseUrl}/${param}`, { observe: 'response' })
        .subscribe(
          (result) => {
            this.isBuyerLoggedIn.next(true);
  
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

  reloadBuyer(param: string) {
    if (isPlatformBrowser(this.platformId)) {
      if (localStorage.getItem(param)) {
        this.isBuyerLoggedIn.next(true);
      }
    }
  }
}
function throwError(arg0: () => Error) {
  throw new Error('Function not implemented.');
}

