import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { combineLatest } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators'; 

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {
  credentials = {
    username: '',
    email: '',
    password: ''
  }
   loginForm : FormGroup;
   errorMessage: string;
   showLognValidation: boolean = false;
   showPassValidation: boolean = false;

  constructor(
     private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
    ) { }

  ngOnInit() {

    this.loginForm = this.fb.group({
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required, 
        Validators.minLength(8)
      ])),
    });

    combineLatest(
      this.loginForm.get('email').valueChanges.pipe(debounceTime(1500),
      tap(val => this.showLognValidation=true)),
      this.loginForm.get('password').valueChanges.pipe(debounceTime(1500),
      tap(val => this.showPassValidation=true))
    ).subscribe();
  }

  onSubmit()
  {
    if(this.loginForm.valid)
    {
      this.credentials.email = this.loginForm.get('email').value;
      this.credentials.password = this.loginForm.get('password').value;
      this.login();
    }
  }

  login() {
    this.authService.login(this.credentials)
      .then(() => this.router.navigate(['/dashboard']))
      .catch(err =>  this.errorMessage = err.message);
  }

}
