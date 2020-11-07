import {BrowserModule} from '@angular/platform-browser';
import {LOCALE_ID, NgModule} from '@angular/core';

import {AppComponent} from './_bootstrap/app.component';
import {LoginComponent} from './credentials/components/login/login.component';
import {SignupComponent} from './credentials/components/signup/signup.component';
import {AppRoutingModule} from './_bootstrap/routing/app-routing.module';
import {CredentialsFormComponent} from './credentials/components/credentials-form/credentials-form.component';
import {RemindersListComponent} from './reminders/reminders-list/reminders-list.component';
import {HTTP_INTERCEPTORS, HttpClientModule} from '@angular/common/http';
import {FormsModule, ReactiveFormsModule} from '@angular/forms';
import {ReminderFormComponent} from './reminders/reminder-form/reminder-form.component';
import {ReminderAddComponent} from './reminders/reminder-add/reminder-add.component';
import {ReminderEditComponent} from './reminders/reminder-edit/reminder-edit.component';
import {AuthInterceptor} from './credentials/interceptors/auth.interceptor';
import {NavBarComponent} from './nav-bar/nav-bar.component';
import {ExpandMenuDirective} from './nav-bar/expand-menu.directive';
import {LogoutComponent} from './credentials/components/logout/logout.component';
import {BackendSelectComponent} from './backend/backend-select/backend-select.component';
import {BackendStatusComponent} from './backend/backend-status/backend-status.component';
import '@angular/common/locales/global/fr';
import {AutoSizeInputModule} from 'ngx-autosize-input';

@NgModule({
  declarations: [
    AppComponent,
    LoginComponent,
    SignupComponent,
    CredentialsFormComponent,
    RemindersListComponent,
    ReminderFormComponent,
    ReminderAddComponent,
    ReminderEditComponent,
    NavBarComponent,
    ExpandMenuDirective,
    LogoutComponent,
    BackendSelectComponent,
    BackendStatusComponent,
  ],
  imports: [
    BrowserModule,
    HttpClientModule,
    ReactiveFormsModule,
    AppRoutingModule,
    FormsModule,
    AutoSizeInputModule,
  ],
  providers: [
    {
      provide: HTTP_INTERCEPTORS,
      useClass: AuthInterceptor,
      multi: true
    },
    {provide: LOCALE_ID, useValue: 'fr'}
  ],
  bootstrap: [AppComponent]
})
export class AppModule {
}
