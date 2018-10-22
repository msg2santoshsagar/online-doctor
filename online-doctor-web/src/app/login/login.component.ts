import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { AuthService } from '../service/auth.service';

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

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true,
  };

  constructor(private router: Router, private http: HttpClient, private authService: AuthService) { }

  ngOnInit() {
  }


  Login() {
    console.log("Request to login : ", this.user);
    this.user.loginError = false;
    if (this.user.userName != this.user.password) {
      this.user.loginError = true;
    } else {

      var userData = {
        userName: this.user.userName,
        password: this.user.password
      }
      this.http.post(environment.LOGIN_END_POINT, userData, this.httpOptions).subscribe(
        (res: any) => {
          console.log("Login success");
          if (res.status == "success") {
            this.authService.doLogin(userData.userName);
            this.router.navigate(['home']);
          } else {
            this.user.loginError = true;
          }
        }, (err: any) => {

          console.log("Error while login :: ", err);
        }
      )

    }
  }

}
