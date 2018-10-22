import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { environment } from 'src/environments/environment';

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

  constructor(private http: HttpClient) {
    var loggedIn = sessionStorage.getItem('loggedIn');
    if (loggedIn != null) {
      this._userLoggedIn = loggedIn == 'true' ? true : false;
    }
    var userName = sessionStorage.getItem('userName');
    if (userName != null) {
      this._userName = userName;
    }
  }

  doLogin(userName: string) {
    sessionStorage.setItem('loggedIn', "true");
    sessionStorage.setItem('userName', userName);
    this._userLoggedIn = true;
    this._userName = userName;
  }

  doLogOut() {
    this.http.get(environment.LOGOUT_END_POINT, this.httpOptions).subscribe();
    sessionStorage.clear();
    this._userLoggedIn = false;
    this._userName = null;
  }

  isUserLoggedIn(): boolean {
    return this._userLoggedIn;
  }

  getUsername(): string {
    return this._userName;
  }


}
