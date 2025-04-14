import { Component } from '@angular/core';
import { ProductService } from '../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { FormBuilder, FormGroup } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';

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

  product: any = {};
  errorMessage: string | undefined;
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private fb: FormBuilder,
    private router: Router,
  ) { }

  updateProduct() {
    this.productService.saveProduct(this.product).subscribe(res => {
      console.log('Product updated successfully!');
    });
  }

  deleteProduct() {
    this.productService.deleteProduct(this.product.id).subscribe(() => {
      console.log('Product deleted!');
    });
  }
  ngOnInit() {
    const productId = this.route.snapshot.paramMap.get('id');
    if (productId) {
      this.productService.getProductById(productId).pipe(
        catchError((error) => {
          console.error('Product not found or server error:', error);
          // Show a message to the user or redirect
          this.errorMessage = 'Product not found.';
          // Optional: Navigate away
          this.router.navigate(['/not-found']); 
          return of(null); 
        })
      ).subscribe((res) => {
        if (res) {
          this.product = res;
        }
      });
    }
  }
}
