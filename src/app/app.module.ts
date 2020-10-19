import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginComponent } from './credentials/login/login.component';
import { SignupComponent } from './credentials/signup/signup.component';
import {AppRoutingModule} from './routing/app-routing.module';
import { CredentialsFormComponent } from './credentials/credentials-form/credentials-form.component';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    CredentialsFormComponent
  ],
  imports: [
    BrowserModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
