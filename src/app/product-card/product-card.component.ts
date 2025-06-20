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
import { MatSnackBar } from '@angular/material/snack-bar';
import { MatSelectModule } from '@angular/material/select';


@Component({
  selector: 'app-product-card',
  imports: [
    CommonModule,
    MatFormFieldModule,
    MatInputModule,
    MatButtonModule,
    FormsModule,
    ReactiveFormsModule,
    MatSelectModule
  ],
  templateUrl: './product-card.component.html',
  styleUrl: './product-card.component.css'
})
export class ProductCardComponent implements OnInit {
  productForm: FormGroup;
  MRP: number = 0;
  productId: string = '';
  isEditMode: boolean = false;
  isSellerLoggedIn = false;
  product: Product | null = null;
  categories: any[] = [];
  subcategories: string[] = [];
  filteredSubcategories: string[] = [];

  constructor(
    private fb: FormBuilder,
    private route: ActivatedRoute,
    private productService: ProductService,
    private sellerService: SellerService,
    private router: Router,
    private snackBar: MatSnackBar
  ) {
    this.productForm = this.fb.group({
      productName: ['', Validators.required],
      category: ['', Validators.required],
      subcategory: [''],
      price: [0, [Validators.required, Validators.min(0)]],
      taxRate: [0],
      discountAmt: [0],
      stock: [0, [Validators.required, Validators.min(0)]],
      brand: [''],
      color: [''],
      weight: [''],
      warranty: [''],
      material: [''],
      features: [''],
      specifications: [''],
      description: ['', Validators.required],
      imageUrl: ['', [Validators.required, Validators.pattern(/^https?:\/\/.+/)]],
      videoUrl: [''],
      rating: [0, [Validators.min(0), Validators.max(5)]]
    });

    this.productForm.valueChanges.subscribe(values => {
      this.MRP = this.calculateFinalPrice(values.price, values.taxRate, values.discountAmt);
    });
  }

  ngOnInit(): void {
    this.sellerService.isSellerLoggedIn.subscribe(status => this.isSellerLoggedIn = status);

    this.loadCategories();
    this.productForm.get('category')?.valueChanges.subscribe(categoryId => {
      this.updateSubcategories(categoryId);
    });
    
    const stateProduct = history.state['product'] as Product;
    this.isEditMode = history.state['isEditMode'] || false;
    if (stateProduct && stateProduct._id) {
      this.product = stateProduct;
      this.patchProductForm(stateProduct);
    } else {
      this.route.queryParamMap.subscribe(params => {
        this.productId = params.get('id') || '';
        this.isEditMode = !!this.productId;

        if (this.isEditMode) {
          this.loadProductForEdit(this.productId);
        }
      });
    }
  }

  loadProductForEdit(id: string): void {
    this.productService.getProductById(id).pipe(
      catchError(err => {
        console.error(err);
        this.snackBar.open('Product not found.', 'Close', { duration: 3000 });
        this.router.navigate(['/']);
        return of(null);
      })
    ).subscribe(product => {
      if (product) {
        this.product = product;
        this.patchProductForm(product);
      }
    });
  }

  loadCategories(): void {
    this.productService.getCategories().subscribe({
      next: (categories) => {
        this.categories = categories;
        if (this.isEditMode && this.product?.category) {
          this.updateSubcategories(this.product.category);
        }
      },
      error: (err) => {
        console.error('Error loading categories:', err);
        this.snackBar.open('Failed to load categories ' + err, 'Close', { duration: 3000 });
      }
    });
  }

  updateSubcategories(categoryId: string): void {
    const selectedCategory = this.categories.find(c => c._id === categoryId);
    this.filteredSubcategories = selectedCategory?.subcategories || [];

    // Reset subcategory if it's not available in the new category
    const currentSubcategory = this.productForm.get('subcategory')?.value;
    if (currentSubcategory && !this.filteredSubcategories.includes(currentSubcategory)) {
      this.productForm.get('subcategory')?.setValue('');
    }
  }
  calculateFinalPrice(price: number, taxRate: number, discountAmt: number): number {
    const tax = (price * taxRate) / 100;
    return parseFloat((price + tax - discountAmt).toFixed(2));
  }
  patchProductForm(product: Product): void {
    this.productForm.patchValue({
      productName: product.productName,
      category: product.category,
      subcategory: product.subcategory || '',
      price: product.priceExclTax,
      taxRate: product.taxRate,
      discountAmt: product.discountAmt,
      stock: product.stock || 0,
      brand: product.brand || '',
      color: product.color || '',
      weight: product.weight || '',
      warranty: product.warranty || '',
      material: product.material || '',
      features: product.features || '',
      specifications: product.specifications || '',
      description: product.description,
      imageUrl: product.imageUrl,
      videoUrl: product.videoUrl || '',
      rating: product.rating || 0
    });

    this.MRP = this.calculateFinalPrice(product.priceExclTax, product.taxRate, product.discountAmt);
  }

  onSubmit(): void {
    if (!this.productForm.valid) return;

    const formValues = this.productForm.value;
    const sellerData = this.sellerService.getSellerData();

    if (!sellerData?.seller?.email || !sellerData?.seller?._id) {
      this.snackBar.open('Seller not authenticated.', 'Close', { duration: 3000 });
      return;
    }

    const payload: Product = {
      productName: formValues.productName,
      category: formValues.category,
      subcategory: formValues.subcategory,
      priceExclTax: formValues.price,
      taxRate: formValues.taxRate,
      discountAmt: formValues.discountAmt,
      stock: formValues.stock,
      brand: formValues.brand,
      color: formValues.color,
      weight: formValues.weight,
      warranty: formValues.warranty,
      material: formValues.material,
      features: formValues.features,
      specifications: formValues.specifications,
      description: formValues.description,
      imageUrl: formValues.imageUrl,
      videoUrl: formValues.videoUrl,
      rating: formValues.rating,
      sellerEmailId: sellerData.seller.email,
      sellerId: sellerData.seller._id
    };

    if (this.isEditMode && this.product?._id) {
      payload._id = this.product._id;
      this.productService.saveProduct(payload).subscribe({
        next: () => this.snackBar.open('Product updated successfully!', 'Close', { duration: 3000 }),
        error: () => this.snackBar.open('Error updating product.', 'Close', { duration: 3000 })
      });
    } else {
      this.productService.saveProduct(payload).subscribe({
        next: () => {
          this.snackBar.open('Product added successfully!', 'Close', { duration: 3000 });
          this.productForm.reset();
          this.MRP = 0;
        },
        error: () => this.snackBar.open('Error adding product.', 'Close', { duration: 3000 })
      });
    }
  }

  deleteProduct(): void {
    if (!this.isEditMode || !this.product?._id) return;

    const confirmDelete = confirm('Are you sure you want to delete this product?');
    if (confirmDelete) {
      this.productService.deleteProduct(this.product._id).subscribe({
        next: () => {
          this.snackBar.open('Product deleted successfully!', 'Close', { duration: 3000 });
          this.router.navigate(['/']);
        },
        error: () => this.snackBar.open('Failed to delete product.', 'Close', { duration: 3000 })
      });
    }
  }
}