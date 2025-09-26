import { Component, EventEmitter, Input, Output, ViewChild, ElementRef } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Subject } from 'rxjs';
import { debounceTime } from 'rxjs/operators';
import { ProductService } from '../../services/product.service';
import { Router } from '@angular/router';
import { Product } from '../../data-type';

@Component({
  selector: 'app-search-bar',
  standalone: true,
  imports: [CommonModule, FormsModule],
  templateUrl: './search-bar.component.html',
  styleUrl: './search-bar.component.css'
})
export class SearchBarComponent {
  @Input() placeholder = 'Search for products, brands and more';
  @Output() searchSelected = new EventEmitter<Product | string>();

  searchText = '';
  filteredProducts: Product[] = [];
  searchSubject = new Subject<string>();

  @ViewChild('searchInput') searchInput!: ElementRef;

  constructor(
    private productService: ProductService,
    private router: Router
  ) {
    this.searchSubject.pipe(debounceTime(500)).subscribe(value => {
      this.searchText = value;
      this.onSearchInput();
    });
  }

  onSearchInput(): void {
    const search = this.searchText.trim().toLowerCase();
    if (!search) {
      this.filteredProducts = [];
      return;
    }

    this.productService.getResultProducts(search, {
      brand: '',
      minPrice: 0,
      maxPrice: 100000
    }, 0, 10).subscribe({
      next: response => {
        this.filteredProducts = response.products.filter(
          p => p.productName.toLowerCase().includes(search)
        );
      },
      error: () => {
        this.filteredProducts = [];
      }
    });
  }

  onOptionSelected(product: Product): void {
    this.searchText = '';
    this.searchSelected.emit(product);
    this.router.navigate(['/product-detail'], { queryParams: { id: product._id } });
  }

  goToSearchResults(): void {
    const searchQuery = this.searchText.trim();
    if (!searchQuery) return;

    const exactMatch = this.filteredProducts.find(
      p => p.productName.toLowerCase() === searchQuery.toLowerCase()
    );

    if (exactMatch) {
      this.router.navigate(['/product-detail'], { queryParams: { id: exactMatch._id } });
    } else {
      this.router.navigate(['/search-results'], { queryParams: { q: searchQuery } });
    }

    this.searchSelected.emit(searchQuery);
    this.filteredProducts = [];
    this.searchInput.nativeElement.blur();
  }
}
