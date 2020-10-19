import { NgModule } from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from '../credentials/login/login.component';
import {SignupComponent} from '../credentials/signup/signup.component';
import {AuthGuard} from '../credentials/guard/auth.guard';

const routes: Routes = [
  { path: '', canActivate: [AuthGuard], children: [
      { path: 'login', component: LoginComponent },
      { path: 'signup', component: SignupComponent },
    ]}
  ];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
