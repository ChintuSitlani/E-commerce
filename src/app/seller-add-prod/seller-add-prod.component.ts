import { Component, Inject, PLATFORM_ID } from '@angular/core';
import { FormBuilder, FormGroup, ReactiveFormsModule, Validators } from '@angular/forms';
import { ProductService } from '../services/product.service';
import { Product } from '../data-type';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { CommonModule } from '@angular/common';
import { SellerService } from '../services/seller.service';
import { MatSnackBar } from '@angular/material/snack-bar';

@Component({
  selector: 'app-seller-add-prod',
  standalone: true,
  imports: [
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    ReactiveFormsModule,
    CommonModule
  ],
  templateUrl: './seller-add-prod.component.html',
  styleUrls: ['./seller-add-prod.component.css']
})
export class SellerAddProdComponent {
  productForm: FormGroup;
  MRP: number = 0;

  constructor(
    private fb: FormBuilder,
    private productService: ProductService,
    @Inject(PLATFORM_ID) private platformId: Object,
    private sellerService: SellerService,
    private snackBar: MatSnackBar,
    
  ) {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      productCategory: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      taxRate: [0],
      discountAmt: [0],
      stock: [0, [Validators.required, Validators.min(0)]]
    });

    this.productForm.valueChanges.subscribe(values => {
      this.MRP = this.calculateFinalPrice(values.price, values.taxRate, values.discountAmt);
    });
  }

  ngOnInit(): void {
    const values = this.productForm.value;
    this.MRP = this.calculateFinalPrice(values.price, values.taxRate, values.discountAmt);
  }

  calculateFinalPrice(price: number, taxRate: number, discountAmt: number): number {
    const taxAmount = (price * taxRate) / 100;
    return parseFloat((price + taxAmount - discountAmt).toFixed(2));
  }

  onSubmit(): void {
    if (this.productForm.valid) {
      const formValues = this.productForm.value;
      const sellerData = this.sellerService.getSellerData();

      if (sellerData?.seller?.email && sellerData?.seller?._id) {
        const product: Product = {
          productName: formValues.productName,
          category: formValues.productCategory,
          priceExclTax: formValues.price,
          description: formValues.description,
          imageUrl: formValues.imageUrl,
          sellerEmailId: sellerData.seller.email,
          sellerId: sellerData.seller._id,
          subcategory: '',
          taxRate: formValues.taxRate,
          discountAmt: formValues.discountAmt,
          stock: formValues.stock || 0,
        };

        this.productService.saveProduct(product).subscribe({
          next: (res: any) => {
            console.log('Product added:', res);
            this.snackBar.open('Product added successfully!', 'Close', { duration: 3000 });
            this.productForm.reset();
            this.MRP = 0; 
          },
          error: (err: any) => {
            console.error('Error:', err);
            this.snackBar.open('Error adding product', 'Close', { duration: 3000 });
          }
        });
      } else {
        console.error("Seller data is not available. Please log in again.");
      }
    }
  }
}
