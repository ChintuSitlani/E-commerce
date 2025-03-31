
import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';
import { AbstractControl, NgModel, ReactiveFormsModule, ValidationErrors } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';

import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { ActivatedRoute } from '@angular/router';
import e from 'express';


@Component({
  selector: 'app-signup',
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
  paramValue: string='';
  constructor(private fb: FormBuilder,private route: ActivatedRoute) {
    this.signinForm = this.fb.group({
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
      confirmPassword: ['', Validators.required]
    }, { validators: this.passwordMatchValidator }); // ✅ Apply custom validator
  }

  // Custom validator to check if password and confirmPassword match
  passwordMatchValidator(form: AbstractControl): ValidationErrors | null {
    const password = form.get('password')?.value;
    const confirmPassword = form.get('confirmPassword')?.value;
    return password === confirmPassword ? null : { passwordMismatch: true };
  }

  onSubmit() {
    this.paramValue = this.route.snapshot.paramMap.get('user') || '';
    console.log('submitted');
    if (this.signinForm.valid) {
      if(this.paramValue == 'seller'){
        console.log('Seller Signup:', this.signinForm.value);
        this.signinForm.reset(); 
      }
      else if(this.paramValue == 'buyer'){
        console.log('Buyer Signup:', this.signinForm.value);
        this.signinForm.reset(); 
      }
    }
  }
  ngOnInit() {
    this.fb = new FormBuilder();
    this.paramValue = this.route.snapshot.paramMap.get('user') || '';
    
    console.log(this.paramValue);
    
  }
}
