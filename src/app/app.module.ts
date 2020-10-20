import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginComponent } from './credentials/components/login/login.component';
import { SignupComponent } from './credentials/components/signup/signup.component';
import {AppRoutingModule} from './routing/app-routing.module';
import { CredentialsFormComponent } from './credentials/components/credentials-form/credentials-form.component';
import { RemindersListComponent } from './components/reminders/reminders-list/reminders-list.component';
import {HttpClientModule} from '@angular/common/http';
import {ReactiveFormsModule} from '@angular/forms';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    CredentialsFormComponent,
    RemindersListComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [],
  bootstrap: [AppComponent]
})
export class AppModule { }
