import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';
import { SellerService } from './services/seller.service';

@Component({
  standalone: true,
  selector: 'app-root',
  imports: [
    RouterOutlet,
    HeaderComponent
  ],
  templateUrl: './app.component.html',
  styleUrl: './app.component.css'
})
export class AppComponent {
  title = 'E-commerce App';
  

  constructor(
    private sellerService: SellerService,
  ) {
    this.sellerService.reloadSeller();
  }
 
}
