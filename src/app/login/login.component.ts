import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import {  ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute, RouterModule } from '@angular/router';
import { SellerService } from '../services/seller.service';
import { BuyerService } from '../services/buyer.service';
import { userLoginData } from '../data-type';

@Component({
  selector: 'app-login',
  imports:
  [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    RouterModule
  ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  paramUserType: string = '';

   userData: userLoginData = {
      id:'',
      email: '',
      password: '',
    };

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private seller: SellerService,
    private buyer: BuyerService,

    )  {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    this.route.paramMap.subscribe(params => {
      this.paramUserType = params.get('user') ?? '';
    });
    if (this.loginForm.valid) {
      this.userData = {
        ...this.userData,
        email: this.loginForm.value.email,
        password: this.loginForm.value.password // Only save the password
      };
      if(this.paramUserType === 'seller')
      {
        this.seller.sellerLogin(this.userData, this.paramUserType);
      }
      else if(this.paramUserType === 'buyer'){
        this.buyer.buyerlogin(this.userData, this.paramUserType);
      }
      else
        throw new Error('Invalid user type '+ this.paramUserType);

      this.loginForm.reset();
    }
  }
  ngOnInit() {
    this.route.paramMap.subscribe(params => {
      this.paramUserType = params.get('user') ?? '';
    });
    if (this.paramUserType === 'seller') {
      this.seller.reloadSeller(this.paramUserType);
    } else if (this.paramUserType === 'buyer') {
      this.buyer.reloadBuyer(this.paramUserType);
    }
  }
}
