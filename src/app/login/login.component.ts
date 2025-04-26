import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
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
      MatCardModule
    ],
  templateUrl: './login.component.html',
  styleUrl: './login.component.css'
})
export class LoginComponent {
  loginForm: FormGroup;
  paramUserType: string = '';

  userData: userLoginData = {
    id: '',
    email: '',
    password: '',
  };

  constructor(
    private fb: FormBuilder,
    private buyer: BuyerService

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
      this.buyer.buyerLogin(this.userData);
      this.loginForm.reset();
    }
  }
  ngOnInit() {
    this.buyer.reloadBuyer();
  }
}
