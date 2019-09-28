import { Injectable } from '@angular/core';
import { AngularFireAuth } from '@angular/fire/auth';
import { User } from 'firebase';
import { Observable } from 'rxjs/index';
import * as firebase from 'firebase';
import { Credentials } from './Credentials';

@Injectable({providedIn: 'root'})
export class AuthService {

  readonly authState$: Observable<User | null> = this.fireAuth.authState;

  constructor(private fireAuth: AngularFireAuth)  { }

  get user(): User | null {
    return this.fireAuth.auth.currentUser;
  }

  login({email, password}: Credentials) {
    this.fireAuth.auth.setPersistence(firebase.auth.Auth.Persistence.SESSION);
    return this.fireAuth.auth.signInWithEmailAndPassword(email, password);
  }

  register({username, email, password }: Credentials) {
    return firebase.auth().createUserWithEmailAndPassword(email, password)
      .then(function (result) { return result.user.updateProfile({ displayName: username }) })
      .catch(function (error) {
        console.log(error);
      });
  }

  logout() {
    return this.fireAuth.auth.signOut();
  }
}

