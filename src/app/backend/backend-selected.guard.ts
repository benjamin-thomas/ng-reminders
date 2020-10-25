import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {BackendSelectService} from './backend-select/service/backend-select.service';

@Injectable({
  providedIn: 'root'
})
export class BackendSelectedGuard implements CanActivate {
  constructor(private backendSelectService: BackendSelectService,
              private router: Router) {
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {

    if (this.backendSelectService.get()) {
      return true;
    }
    return this.router.createUrlTree(['select-backend']);
  }

}
