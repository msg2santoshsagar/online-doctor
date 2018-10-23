import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';
import { Router } from '@angular/router';

@Injectable({
  providedIn: 'root'
})
export class AuthService {

  private _userLoggedIn: boolean = false;
  private _userName: string = null;

  httpOptions = {
    headers: new HttpHeaders({ 'Content-Type': 'application/json' }),
    withCredentials: true,
  };

  constructor(private http: HttpClient, private router: Router) {
    var loggedIn = sessionStorage.getItem('loggedIn');
    if (loggedIn != null) {
      this._userLoggedIn = loggedIn == 'true' ? true : false;
    }
    var userName = sessionStorage.getItem('userName');
    if (userName != null) {
      this._userName = userName;
    }
  }

  validateLogin() {
    this.http.get(environment.CURRENT_USER_END_POINT, this.httpOptions).subscribe(
      (res: any) => {
        console.log("current user response :: ", res);
        if (res != null && res.userName != null) {
          this.doLogin(res.userName);
        } else {
          this.doLogOut();
        }
      }, (err: any) => {
        console.log("current user error :: ", err);
      }
    )
  }

  doLogin(userName: string) {
    sessionStorage.setItem('loggedIn', "true");
    sessionStorage.setItem('userName', userName);
    this._userLoggedIn = true;
    this._userName = userName;
  }

  doLogOut(redirectToLogin?: boolean) {
    console.log("Doing logout");
    this.http.get(environment.LOGOUT_END_POINT, this.httpOptions).subscribe();
    sessionStorage.clear();
    this._userLoggedIn = false;
    this._userName = null;
    if (redirectToLogin == true) {
      this.router.navigate['login'];
    }
  }

  isUserLoggedIn(): boolean {
    return this._userLoggedIn;
  }

  getUsername(): string {
    return this._userName;
  }


}
