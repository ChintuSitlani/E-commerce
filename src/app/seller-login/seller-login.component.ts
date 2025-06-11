import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { SellerService } from '../services/seller.service';
import { buyers } from '../data-type';
import { MatIconModule } from '@angular/material/icon';

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
      MatIconModule
    ],
  templateUrl: './seller-login.component.html',
  styleUrl: './seller-login.component.css'
})
export class SellerLoginComponent {
  loginForm: FormGroup;
  paramUserType: string = '';

  userData: buyers = {
    _id: '',
    email: '',
    password: '',
  };
  showPassword: boolean = false; 

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
    }
  }
  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  ngOnInit() {
    this.seller.reloadSeller();
  }
}
