import {Injectable} from '@angular/core';
import {ActivatedRouteSnapshot, CanActivate, Router, RouterStateSnapshot, UrlTree} from '@angular/router';
import {Observable} from 'rxjs';
import {BackendSelectService} from './backend-select/service/backend-select.service';
import {Backend} from './backend.model';

@Injectable({
  providedIn: 'root'
})
export class BackendSelectedGuard implements CanActivate {
  private backend: Backend;

  constructor(private backendSelectService: BackendSelectService,
              private router: Router) {

    this.backendSelectService.emitter
      .subscribe(([backend]) => {
        this.backend = backend;
      });
  }

  canActivate(
    next: ActivatedRouteSnapshot,
    state: RouterStateSnapshot): Observable<boolean | UrlTree> | Promise<boolean | UrlTree> | boolean | UrlTree {
    if (this.backend) {
      return true;
    }
    return this.router.createUrlTree(['select-backend']);
  }

}
