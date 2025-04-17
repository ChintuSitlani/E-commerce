import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SellerService } from '../services/seller.service';
import { userLoginData } from '../data-type';

@Component({
  selector: 'app-seller-login',
  imports:
    [
      CommonModule,
      ReactiveFormsModule,
      MatFormFieldModule,
      MatInputModule,
      MatButtonModule,
      MatCardModule,
    ],
  templateUrl: './seller-login.component.html',
  styleUrl: './seller-login.component.css'
})
export class SellerLoginComponent {
  loginForm: FormGroup;
  paramUserType: string = '';

  userData: userLoginData = {
    id: '',
    email: '',
    password: '',
  };

  constructor(
    private fb: FormBuilder,
    private seller: SellerService

  ) {
    this.loginForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]]
    });
  }

  onSubmit() {
    if (this.loginForm.valid) {
      this.userData = {
        ...this.userData,
        email: this.loginForm.value.email,
        password: this.loginForm.value.password // Only save the password
      };

      this.seller.sellerLogin(this.userData);
      this.loginForm.reset();
    }
  }
  ngOnInit() {
    this.seller.reloadSeller();
  }
}
