import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule, FormBuilder, FormGroup, Validators, AbstractControl, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { ActivatedRoute } from '@angular/router';
import { SellerService } from '../servies/seller.service';
import { sellerData } from '../data-type';

@Component({
  selector: 'app-signup',
  standalone: true,
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    MatCardModule
  ],
  templateUrl: './signup.component.html',
  styleUrl: './signup.component.css'
})
export class SignupComponent {
  signinForm: FormGroup;
  paramValue: string = '';

  sellerData: sellerData = {
    name: '',
    email: '',
    password: '',
  };
  router: any;

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private seller: SellerService
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
    this.paramValue = this.route.snapshot.paramMap.get('user') || '';
    if (this.signinForm.valid) {
      this.sellerData = {
        ...this.sellerData,
        name: this.signinForm.value.name,
        email: this.signinForm.value.email,
        password: this.signinForm.value.password // Only save the password
      };
      
      this.seller.userSignup(this.sellerData, this.paramValue).subscribe({
        next: (res) => {
          console.log(res);
          // Redirect to sellerHome page only if there's no error
          this.router.navigate(['/sellerHome']);
        },
        error: (err) => console.error('Signup Error:', err) 
      });

      this.signinForm.reset();
    }
  }

 
}

