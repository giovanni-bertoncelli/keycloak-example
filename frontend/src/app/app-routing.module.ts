import { NgModule } from '@angular/core';
import { RouterModule, Routes } from '@angular/router';
import { AuthGuard } from './guards/keycloak.guard';
import { HomeComponent } from './pages/home/home.component';
import { UnauthComponent } from './pages/unauth/unauth.component';

const routes: Routes = [{
  path: '',
  pathMatch: 'full',
  redirectTo: 'home'
}, {
  path: 'home',
  canActivate: [AuthGuard],
  component: HomeComponent
}, {
  path: 'unauth',
  component: UnauthComponent
}];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
