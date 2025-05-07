import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { Product } from '../data-type';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule} from '@angular/common';
import { SellerService } from '../services/seller.service';

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


  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private sellerService: SellerService // Inject SellerService
  ) {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      productCategory: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      taxRate: [0],
      discountRate: [0]
    });
  }

  onSubmit() {
    if (this.productForm.valid) {
      const formValues = this.productForm.value;
      const sellerData = this.sellerService.getSellerData();
      
      if (sellerData && sellerData.email && sellerData._id) {
        const product: Product = {
          productName: formValues.productName,
          category: formValues.productCategory,
          price: formValues.price,
          description: formValues.description,
          imageUrl: formValues.imageUrl,
          sellerEmailId: sellerData.email,
          sellerId: sellerData._id,
          subcategory: '',
          taxRate: formValues.taxRate,
          discountRate: formValues.discountRate
        };
  
        this.productService.saveProduct(product).subscribe({
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
      } else {
        console.error("Seller data is not available. Please log in again.");
      }
    }
  }
}