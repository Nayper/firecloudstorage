import { Component, OnInit } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { AuthService } from 'src/app/auth/services/auth.service';
import { User } from 'firebase';
import { Router } from '@angular/router';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css']
})
export class HeaderComponent implements OnInit {

  private currentUser : User;
  public selectedValue: string;

  constructor(
    private translate: TranslateService, 
    private router: Router, 
    private authService: AuthService) 
  {
    this.authService.authState$.subscribe((newUser: User) => { this.currentUser = newUser; });

    translate.addLangs(['en', 'pl']);
    if (localStorage.getItem('locale')) {
      const browserLang = localStorage.getItem('locale');
      translate.use(browserLang.match(/en|pl/) ? browserLang : 'en');
    } else {
      localStorage.setItem('locale', 'en');
      translate.setDefaultLang('en');
    }
  }

  ngOnInit() {
    this.selectedValue = 'en';
  }

  changeLanguage(event) {
    localStorage.setItem('locale', event.value);
    this.translate.use(event.value);
  }

  logout() {
    this.authService.logout().then(() => this.router.navigate(['/login']));
  }
}
