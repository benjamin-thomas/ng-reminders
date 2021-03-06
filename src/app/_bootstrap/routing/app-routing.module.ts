import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from '../../credentials/components/login/login.component';
import {SignupComponent} from '../../credentials/components/signup/signup.component';
import {AuthGuard} from '../../credentials/guards/auth.guard';
import {RemindersListComponent} from '../../reminders/reminders-list/reminders-list.component';
import {ReminderAddComponent} from '../../reminders/reminder-add/reminder-add.component';
import {ReminderEditComponent} from '../../reminders/reminder-edit/reminder-edit.component';
import {LogoutComponent} from '../../credentials/components/logout/logout.component';
import {BackendSelectComponent} from '../../backend/backend-select/backend-select.component';
import {BackendSelectedGuard} from '../../backend/backend-selected.guard';

const routes: Routes = [
  {
    path: '', canActivate: [BackendSelectedGuard, AuthGuard], children: [
      {path: '', component: RemindersListComponent}, // default route
      {
        path: 'reminders', children: [
          {path: 'list', component: RemindersListComponent},
          {path: 'add', component: ReminderAddComponent},
          {path: 'edit/:id', component: ReminderEditComponent},
        ]
      }
    ]
  },
  // Make sure to update AuthInterceptor to prevent unwanted auth headers injection
  {path: 'login', component: LoginComponent, canActivate: [BackendSelectedGuard]},
  {path: 'logout', component: LogoutComponent},
  {path: 'signup', component: SignupComponent, canActivate: [BackendSelectedGuard]},
  {path: 'select-backend', component: BackendSelectComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
