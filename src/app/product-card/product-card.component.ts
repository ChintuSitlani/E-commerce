import { Component } from '@angular/core';
import { ProductService } from '../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup, Validators } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
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
export class ProductCardComponent {

  productForm: FormGroup;
  productId: string = '';
  product: any = {};
  errorMessage: string | undefined;
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private fb: FormBuilder,
    private router: Router,
  ) {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      productCategory: ['', Validators.required],
      price: [0, [Validators.required, Validators.min(0)]],
      description: ['', Validators.required],
      imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]]
    });
  }

  updateProduct() {
    //if (this.productForm.valid) {
      const formValues = this.productForm.value;
      const product: any = {
        _id : this.productId,
        productName: formValues.productName,
        category: formValues.productCategory,
        price: formValues.price,
        description: formValues.description,
        imageUrl: formValues.imageUrl,
        subcategory: '',

      };
      this.productService.saveProduct(product).subscribe({
        next: (res: any) => {
          console.log('Product updated:', res);
          alert('Product updated successfully!');
        },
        error: (err: any) => {
          console.error('Error:', err);
          alert('Error updating product');
        },
      });
  }

  deleteProduct() {
    const userConfirmed = confirm('Are you sure you want to delete this product?');
    if (userConfirmed) {
      this.productService.deleteProduct(this.product._id).subscribe(() => {
        console.log('Product deleted!');
      });
    }
    else
      console.log("Deletion canceled by the user.");
  }
  ngOnInit() {
    this.route.queryParamMap.subscribe(params => {
      this.productId = params.get('id')|| '';
      if (this.productId) {
        this.productService.getProductById(this.productId).pipe(
          catchError((error) => {
            console.error('Product not found or server error:', error);
            this.errorMessage = 'Product not found.';
            this.router.navigate(['/page-not-found']);
            return of(null);
          })
        ).subscribe((res) => {
          if (res) {
            this.product = res;
            
            this.product = {
              ...res,
              productCategory: res.category // alias 'category' to 'productCategory' for display
            };
          }
        });
      }
    });
  }
}
