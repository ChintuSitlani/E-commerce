import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { userSignupData } from '../data-type';
import { SellerService } from '../services/seller.service';

@Component({
  selector: 'app-seller-signup',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './seller-signup.component.html',
  styleUrl: './seller-signup.component.css'
})
export class SellerSignupComponent {
  signinForm: FormGroup;

  userData: userSignupData = {
    name: '',
    email: '',
    password: '',
  };


  constructor(
    private fb: FormBuilder,
    private seller: SellerService,
  ) {
    this.signinForm = this.fb.group({
      name: ['', [Validators.required, Validators.pattern(/^[a-zA-Z ]+$/)]],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator });
  }

  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    if (this.signinForm.valid) {
      this.userData = {
        ...this.userData,
        name: this.signinForm.value.name,
        email: this.signinForm.value.email,
        password: this.signinForm.value.password // Only save the password
      };
      this.seller.sellerSignup(this.userData,);
    }
    this.signinForm.reset();

  }

  ngOnInit() {
    this.seller.reloadSeller();
  }
}
