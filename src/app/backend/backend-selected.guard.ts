import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {BackendSelectService} from './backend-select/service/backend-select.service';
import {Backend} from './backend.model';

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

    const currentBackendValue = this.backendSelectService.get();
    const isValidBackend = new Backend(currentBackendValue).isValid;

    return isValidBackend || this.router.createUrlTree(['select-backend']);
  }

}
