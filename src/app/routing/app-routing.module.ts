import {NgModule} from '@angular/core';
import {RouterModule, Routes} from '@angular/router';
import {LoginComponent} from '../credentials/components/login/login.component';
import {SignupComponent} from '../credentials/components/signup/signup.component';
import {AuthGuard} from '../credentials/guards/auth.guard';
import {RemindersListComponent} from '../components/reminders/reminders-list/reminders-list.component';
import {ReminderAddComponent} from '../components/reminders/reminder-add/reminder-add.component';
import {ReminderEditComponent} from '../components/reminders/reminder-edit/reminder-edit.component';
import {LogoutComponent} from '../credentials/components/logout/logout.component';

const routes: Routes = [
  {
    path: '', canActivate: [AuthGuard], children: [
      { path: '', component: RemindersListComponent}, // default route
      {
        path: 'reminders', children: [
          {path: 'list', component: RemindersListComponent},
          {path: 'add', component: ReminderAddComponent},
          {path: 'edit/:id', component: ReminderEditComponent},
        ]
      }
    ]
  },
  {path: 'login', component: LoginComponent},
  {path: 'logout', component: LogoutComponent},
  {path: 'signup', component: SignupComponent},
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule {
}
