import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';
import {Backend} from '../../backend.model';

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
    return new Backend(json.name, json.config);
  }

  save(backend: Backend) {
    localStorage.setItem(KEY, JSON.stringify(backend));
    this.emitter.next(backend);
  }
}
