import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Backend} from '../../backend.model';
import {environment} from '../../../../environments/environment';

const KEY = 'backendName';

@Injectable({
  providedIn: 'root'
})
export class BackendSelectService {

  emitter = new BehaviorSubject<Backend>(this.get());

  get(): Backend {
    const json = JSON.parse(localStorage.getItem(KEY));
    if (json === null) {
      return null;
    }
    const backend = new Backend(json.name, json.paths, json.bugs);
    backend.setHost(environment.apiHost);
    return backend;
  }

  save(backend: Backend) {
    localStorage.setItem(KEY, JSON.stringify(backend));
    this.emitter.next(backend);
  }
}
