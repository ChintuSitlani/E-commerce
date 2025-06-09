import { Component, OnInit } from '@angular/core';
import { ProductService } from '../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormBuilder, FormsModule, ReactiveFormsModule, Validators } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SellerService } from '../services/seller.service';
import { FormGroup } from '@angular/forms';
import { Product } from '../data-type';
@Component({
  selector: 'app-product-card',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent implements OnInit {
  productId: string = '';
  product: Product = {
    productName: '',
    category: '',
    description: '',
    imageUrl: '',
    sellerId: '',
    sellerEmailId: '',
    priceExclTax: 0,
    taxRate: 0,
    discountAmt: 0
  };
  errorMessage?: string;
  isSellerLogedIn = false;
  MRP: number = 0;
  productForm: FormGroup;

  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private sellerService: SellerService,
    private fb: FormBuilder
  ) {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      category: ['', Validators.required],
      price: [0, Validators.required],
      taxRate: [0],
      discountAmt: [0],
      description: [''],
      stock: [0, Validators.min(0)],
      imageUrl: ['', Validators.required],
    });

    this.productForm.valueChanges.subscribe(values => {
      this.MRP = this.calculateFinalPrice(values.price, values.taxRate, values.discountAmt);
    });
  }

  ngOnInit(): void {
    this.route.queryParamMap.subscribe(params => {
      this.productId = params.get('id') || '';
      if (this.productId) {
        this.productService.getProductById(this.productId)
          .pipe(
            catchError(error => {
              console.error('Product not found or server error:', error);
              this.errorMessage = 'Product not found.';
              this.router.navigate(['/page-not-found']);
              return of(null);
            })
          )
          .subscribe(res => {
            if (res) {
              this.product = res;
              this.productForm.patchValue({
                productName: res.productName,
                category: res.category,
                price: res.priceExclTax || 0,
                taxRate: res.taxRate || 0,
                discountAmt: res.discountAmt || 0,
                description: res.description,
                stock: res.stock || 0,
                imageUrl: res.imageUrl
              });
              this.MRP = this.calculateFinalPrice(res.priceExclTax || 0, res.taxRate || 0, res.discountAmt || 0);
            }
          });
      }
    });

    this.sellerService.isSellerLoggedIn.subscribe(isLoggedIn => {
      this.isSellerLogedIn = isLoggedIn;
    });
  }

  calculateFinalPrice(price: number, taxRate: number, discountAmt: number): number {
    const taxAmount = (price * taxRate) / 100;
    return parseFloat((price + taxAmount - discountAmt).toFixed(2));
  }

  updateProduct(): void {
    if (this.isSellerLogedIn && this.productForm.valid) {
      const formValues = this.productForm.value;
      const updatedProduct = {
        ...this.product,
        productName: formValues.productName,
        category: formValues.category,
        priceExclTax: formValues.price,
        taxRate: formValues.taxRate,
        discountAmt: formValues.discountAmt,
        stock: formValues.stock || 0,
        description: formValues.description,
        imageUrl: formValues.imageUrl,
      };

      this.productService.saveProduct(updatedProduct).subscribe({
        next: () => alert('Product updated successfully!'),
        error: (err) => {
          console.error('Error:', err);
          alert('Error updating product');
        },
      });
    } else {
      alert('You must be logged in as a seller to update the product.');
    }
  }

  deleteProduct(): void {
    if (this.isSellerLogedIn && this.product._id) {
      const confirmDelete = confirm('Are you sure you want to delete this product?');
      if (confirmDelete) {
        this.productService.deleteProduct(this.product._id).subscribe(() => {
          alert('Product deleted!');
          this.router.navigate(['/']);
        });
      }
    } else {
      alert('You must be logged in as a seller to delete the product.');
    }
  }
}