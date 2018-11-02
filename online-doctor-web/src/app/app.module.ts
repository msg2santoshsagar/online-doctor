import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { HttpClientModule, HTTP_INTERCEPTORS } from '@angular/common/http';

import { AppRoutingModule } from './app-routing.module';
import { AppComponent } from './app.component';
import { HomeComponent } from './home/home.component';
import { LoginComponent } from './login/login.component';
import { ChatTimeIndicatorPipe } from './pipes/chat-time-indicator.pipe';
import { NewlineHtmlPipe } from './pipes/newline-html.pipe';
import { ProfilePicPipe } from './pipes/profile-pic.pipe';
import { CustomHttpInterceptor } from './interceptors/custom-http.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    HomeComponent,
    LoginComponent,
    ChatTimeIndicatorPipe,
    NewlineHtmlPipe,
    ProfilePicPipe
  ],
  imports: [
    BrowserModule,
    FormsModule,
    AppRoutingModule,
    HttpClientModule
  ],
  providers: [
    CustomHttpInterceptor,
    {
      provide: HTTP_INTERCEPTORS,
      useClass: CustomHttpInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
