import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';
import { LoginComponent } from './login/login.component';
import { HomeComponent } from './home/home.component';
import { NotAuthenticatedGuard } from './guards/not-authenticated.guard';
import { AlwaysAuthenticatedGuard } from './guards/always-authenticated.guard';

const routes: Routes = [
  {
    path: 'login',
    component: LoginComponent,
    canActivate: [NotAuthenticatedGuard]
  }, {
    path: 'home',
    component: HomeComponent,
    canActivate: [AlwaysAuthenticatedGuard]
  }, {
    path: '',
    pathMatch: 'full',
    redirectTo: 'login'
  }


];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
