import { Injectable } from '@angular/core';
import { HttpInterceptor, HttpRequest, HttpHandler, HttpEvent, HttpResponse } from '@angular/common/http';
import { Observable, EMPTY } from 'rxjs';
import { tap } from 'rxjs/operators';
import { Router } from '@angular/router';
import { AuthService } from '../service/auth.service';

@Injectable({
  providedIn: 'root'
})
export class CustomHttpInterceptor implements HttpInterceptor {

  constructor(private authService: AuthService) { }

  // intercept request and add token
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    // modify request
    /* request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${localStorage.getItem('MY_TOKEN')}`
      }
    }); */

    //console.log("----request----");

    //console.log(request);

    //console.log("--- end of request---");


    return next.handle(request)
      .pipe(
        tap(event => {
          if (event instanceof HttpResponse) {

            //console.log(" all looks good");
            // http response status code
            //console.log(event.status);

            try {
              console.log("Response : ", event.body);
              if (event.body.status === 'LOGGED_OFF') {
                console.log("Status from server found as logged off , need to redirect to login page");
                this.authService.doLogOut(true);
              }
            } catch (e) {
              console.log("Error :: ", e);
            }


          }
        }, error => {
          // http response status code
          console.log("----response----");
          console.error("status code:");
          console.error(error.status);
          console.error(error.message);
          console.log("--- end of response---");

        })
      )

  };

}
