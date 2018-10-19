import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css']
})
export class LoginComponent implements OnInit {

  user = {
    userName: 'admin',
    password: 'admin',
    loginError: false
  };


  constructor(private router: Router) { }

  ngOnInit() {
  }

  Login() {
    console.log("Request to login : ", this.user);
    this.user.loginError = false;
    if (this.user.userName != this.user.password) {
      this.user.loginError = true;
    } else {
      console.log("Login success");
      this.router.navigate(['home']);
    }
  }

}
