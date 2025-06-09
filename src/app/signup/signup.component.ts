import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { userSignupData } from '../data-type';
import { BuyerService } from '../services/buyer.service';
import { MatIconModule } from '@angular/material/icon';
import { Router } from '@angular/router';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule,
    MatIconModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  signinForm: FormGroup;

  userData: userSignupData = {
    name: '',
    email: '',
    password: '',
  };
  showPassword: boolean = false;

  constructor(
    private fb: FormBuilder,
    private buyer: BuyerService,
    private router: Router,
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
      password: this.signinForm.value.password
    };

    this.buyer.buyerSignup(this.userData).subscribe({
      next: (result) => {
        this.buyer.isBuyerLoggedIn.next(true);

        if (typeof window !== 'undefined') {
          localStorage.setItem('buyer', JSON.stringify(result.body));
        }

        this.router.navigate(['buyer-home']);
        this.signinForm.reset(); 
      },
      error: (error) => {
        console.error('Signup failed:', error);
      }
    });
  }
}

  togglePasswordVisibility() {
    this.showPassword = !this.showPassword;
  }
  ngOnInit() {
    {
      this.buyer.reloadBuyer();
    }
  }
}