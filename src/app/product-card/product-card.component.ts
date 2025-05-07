import { Component } from '@angular/core';
import { ProductService } from '../services/product.service';
import { ActivatedRoute, Router } from '@angular/router';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatButtonModule } from '@angular/material/button';
import { FormsModule, ReactiveFormsModule } from '@angular/forms';
import { CommonModule } from '@angular/common';
import { catchError } from 'rxjs/operators';
import { of } from 'rxjs';
import { SellerService } from '../services/seller.service';

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
  productId: string = '';
  product: any = {};
  errorMessage: string | undefined;
  isSellerLogedIn: boolean = false;
  constructor(
    private route: ActivatedRoute,
    private productService: ProductService,
    private router: Router,
    private sellerService: SellerService
  ) { }

  ngOnInit() {
    this.route.queryParamMap.subscribe((params) => {
      this.productId = params.get('id') || '';
      if (this.productId) {
        this.productService
          .getProductById(this.productId)
          .pipe(
            catchError((error) => {
              console.error('Product not found or server error:', error);
              this.errorMessage = 'Product not found.';
              this.router.navigate(['/page-not-found']);
              return of(null);
            })
          )
          .subscribe((res) => {
            if (res) {
              this.product = {
                ...res,
                productCategory: res.category,
              };
            }
          });
      }
    });
    this.sellerService.isSellerLoggedIn.subscribe((isLoggedIn) => {
      this.isSellerLogedIn = isLoggedIn;
    });
  }

  updateProduct() {
    if (this.isSellerLogedIn === true) {

      const product = {
        ...this.product,
        category: this.product.productCategory, // remap field for backend
      };

      this.productService.saveProduct(product).subscribe({
        next: (res: any) => {
          alert('Product updated successfully!');
        },
        error: (err: any) => {
          console.error('Error:', err);
          alert('Error updating product');
        },
      });
    } else {
      alert('You must be logged in as a seller to update the product.');
    }
  }

  deleteProduct() {
    if (this.isSellerLogedIn === true) {
      const userConfirmed = confirm('Are you sure you want to delete this product?');
      if (userConfirmed) {
        this.productService.deleteProduct(this.product._id).subscribe(() => {
          console.log('Product deleted!');
        });
      } else {
        console.log('Deletion canceled by the user.');
      }
    } else {
      alert('You must be logged in as a seller to delete the product.');
    }
  }
}
