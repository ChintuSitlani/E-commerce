import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ReactiveFormsModule } from '@angular/forms';
import { MatFormFieldModule } from '@angular/material/form-field';
import { MatInputModule } from '@angular/material/input';
import { MatSelectModule } from '@angular/material/select';
import { MatOptionModule } from '@angular/material/core';
import { MatButtonModule } from '@angular/material/button';
import { MatCardModule } from '@angular/material/card';
import { FormsModule } from '@angular/forms';
import { MatCheckboxModule } from '@angular/material/checkbox';

import { ProductService } from '../services/product.service';
import { Product } from '../data-type';
import { ActivatedRoute } from '@angular/router';
import { MatExpansionModule } from '@angular/material/expansion';
import { LayoutModule } from '@angular/cdk/layout';
import { Router } from '@angular/router';

@Component({
  selector: 'app-search-results',
  imports: [
    CommonModule,
    ReactiveFormsModule,
    MatFormFieldModule,
    MatInputModule,
    MatSelectModule,
    MatOptionModule,
    MatButtonModule,
    MatCardModule,
    FormsModule,
    MatCheckboxModule,
    MatExpansionModule,
    LayoutModule
  ],
  templateUrl: './search-results.component.html',
  styleUrl: './search-results.component.css'
})
export class SearchResultsComponent implements OnInit {
  allProducts: Product[] = [];
  totalCount = 0;
  currentSkip = 0;
  limit = 10;
  loading = false;
  priceInclTax: number = 0;
  searchTerm = '';
  filters: { brand: string; minPrice: number; maxPrice: number } = {
    brand: '',
    minPrice: 0,
    maxPrice: 1000000
  };

  constructor(
    private productService: ProductService,
    private route: ActivatedRoute,
    private router: Router
  ) { }

  ngOnInit(): void {
    this.route.queryParams.subscribe(params => {
      this.searchTerm = params['q'] || '';
      this.resetAndLoadProducts();
    });
  }

  // Reset state and load first set of products
  resetAndLoadProducts(): void {
    this.allProducts = [];
    this.currentSkip = 0;
    this.totalCount = 0;
    this.loadMoreProducts();
  }


  loadMoreProducts(): void {
    this.loading = true;

    const filtersToSend = { ...this.filters };

    this.productService.getResultProducts(
      this.searchTerm,
      filtersToSend,
      this.currentSkip,
      this.limit
    ).subscribe(response => {
      console.log('Products loaded:', response);
      console.log('Total count:', response.products);
      this.allProducts = [...this.allProducts, ...response.products];
      this.totalCount = response.total;
      this.currentSkip += this.limit;
      this.loading = false;
    }, () => {
      this.loading = false;
    });
  }

  // Reapply filters and reload from start
  applyFilters(): void {
    this.resetAndLoadProducts();
  }
  viewProductDetail(id?: string) {
    if (id) {
      this.router.navigate(['/product-detail'], { queryParams: { id } });
    }

  }
  getSellingPriceInclTax(priceExclTax: number, taxRate: number): number {
    const taxAmount = (priceExclTax * taxRate) / 100;
    this.priceInclTax = parseFloat((priceExclTax + taxAmount).toFixed(2));
    return this.priceInclTax;
  }
  getDiscountedPrice(priceExclTax: number, taxRate: number,discountAmt: number): number {
    this.priceInclTax =  this.getSellingPriceInclTax(priceExclTax, taxRate);
    return parseFloat((this.priceInclTax - discountAmt).toFixed(2));
  }
  getDiscountPercentage(discountedAmt: number): number {
    return parseFloat(((discountedAmt / this.priceInclTax) * 100).toFixed(2));
  }
}