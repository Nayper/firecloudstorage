import { Component, OnInit } from '@angular/core';
import { FormGroup, FormControl, FormBuilder, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { combineLatest } from 'rxjs';
import { debounceTime, tap } from 'rxjs/operators'; 

@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css']
})
export class RegisterComponent implements OnInit {
  credentials = {
    username: '',
    email: '',
    password: ''
  }
   registerForm : FormGroup;
   errorMessage: string;
   showUsernameValidation: boolean = false;
   showEmailValidation: boolean = false;
   showPassValidation: boolean = false;

  constructor(
    private fb: FormBuilder,
    private router: Router,
    private authService: AuthService
    ) {}

  ngOnInit() {
    this.registerForm = this.fb.group({
      username: new FormControl('', Validators.compose([
        Validators.required,
        Validators.minLength(3)
      ])),
      email: new FormControl('', Validators.compose([
        Validators.required,
        Validators.pattern('^[a-zA-Z0-9_.+-]+@[a-zA-Z0-9-]+.[a-zA-Z0-9-.]+$')
      ])),
      password: new FormControl('', Validators.compose([
        Validators.required, 
        Validators.minLength(8)
      ])),
    })

    combineLatest(
      this.registerForm.get('username').valueChanges.pipe(debounceTime(1500),
      tap(val => this.showUsernameValidation=true)),
      this.registerForm.get('email').valueChanges.pipe(debounceTime(1500),
      tap(val => this.showEmailValidation=true)),
      this.registerForm.get('password').valueChanges.pipe(debounceTime(1500),
      tap(val => this.showPassValidation=true))
    ).subscribe();
  }

  onSubmit()
  {
    if(this.registerForm.valid)
    {
      this.credentials.username = this.registerForm.get('username').value;
      this.credentials.email = this.registerForm.get('email').value;
      this.credentials.password = this.registerForm.get('password').value;
      this.register();
    }
  }

  register() {
    this.authService.register(this.credentials)
      .then(() => this.authService.login(this.credentials)
        .then(() => this.router.navigate(['/dashboard']))
        .catch(err => this.errorMessage = err.message))
      .catch(err => console.log(err.message));
  }
}
