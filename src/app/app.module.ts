import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';

import { AppComponent } from './app.component';
import { LoginComponent } from './credentials/components/login/login.component';
import { SignupComponent } from './credentials/components/signup/signup.component';
import {AppRoutingModule} from './routing/app-routing.module';
import { CredentialsFormComponent } from './credentials/components/credentials-form/credentials-form.component';
import { RemindersListComponent } from './components/reminders/reminders-list/reminders-list.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {ReactiveFormsModule} from '@angular/forms';
import { ReminderFormComponent } from './components/reminders/reminder-form/reminder-form.component';
import { ReminderAddComponent } from './components/reminders/reminder-add/reminder-add.component';
import { ReminderEditComponent } from './components/reminders/reminder-edit/reminder-edit.component';
import {AuthInterceptor} from './auth.interceptor';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    CredentialsFormComponent,
    RemindersListComponent,
    ReminderFormComponent,
    ReminderAddComponent,
    ReminderEditComponent
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    }
  ],
  bootstrap: [AppComponent]
})
export class AppModule { }
