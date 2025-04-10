import { Component } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { Product } from '../data-type';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-seller-add-prod',
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './seller-add-prod.component.html',
  styleUrl: './seller-add-prod.component.css'
})
export class SellerAddProdComponent {
  productForm: FormGroup;


  constructor(private fb: FormBuilder,private productService: ProductService) {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]]
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      const product: Product = this.productForm.value;
      this.productService.addProduct(product).subscribe({
        next: (res: any) => {
          console.log('Product added:', res);
          alert('Product added successfully!');
          this.productForm.reset();
        },
        error: (err: any) => {
          console.error('Error:', err);
          alert('Error adding product');
        },
      });
    }
  }
}
