import { Component, OnInit } from '@angular/core';
import { AuthService } from '../../services/authentication/auth.service';
import { Injectable } from '@angular/core';
import { CanActivate, Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  test: string = 'just a test';
  router: Router;
  constructor(private auth: AuthService, private _router: Router) {
    this.router = _router;
  }
  ngOnInit(): void {
  }

  public userName: string = "";
  public password: string = "";
  public authenticationResult = "";
  tryLogin() {
    let sampleUser: any = {
      user: this.userName,
      password: this.password
    };

    this.auth.login(sampleUser).then((authenticationResponse) => {
      localStorage.setItem('auth_token', authenticationResponse.auth_token)
      this.router.navigateByUrl('/');
    }).catch((err) => {
      this.authenticationResult = err.error;
    });
  }
}
