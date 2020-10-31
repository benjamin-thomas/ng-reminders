import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Backend} from '../../backend.model';
import {environment} from '../../../../environments/environment';
import {BackendFactory, BackendNames} from '../../backend-factory';

const KEY = 'backendName';

@Injectable({
  providedIn: 'root'
})
export class BackendSelectService {

  emitter = new BehaviorSubject<[Backend, string]>(this.initSubject());

  initSubject(): [Backend, string] {
    const backendName: BackendNames = localStorage.getItem(KEY) as BackendNames;
    if (backendName === null) {
      return [null, 'NONE'];
    }
    const backend = BackendFactory.create(backendName, environment.apiHost);
    return [backend, backendName];
  }

  save(backendName: BackendNames) {
    localStorage.setItem(KEY, backendName);

    const backend = BackendFactory.create(backendName, environment.apiHost);
    this.emitter.next([backend, backendName]);
  }
}
