import {Injectable} from '@angular/core';
import {BehaviorSubject} from 'rxjs';

const KEY = 'backendName';

@Injectable({
  providedIn: 'root'
})
export class BackendSelectService {
  backendName = new BehaviorSubject<string>(this.get());

  get(): string {
    return localStorage.getItem(KEY);
  }

  save(backendName: string) {
    localStorage.setItem(KEY, backendName);
    this.backendName.next(backendName);
  }
}
