import {Injectable} from '@angular/core';

const KEY = 'backendName';

@Injectable({
  providedIn: 'root'
})
export class BackendSelectService {

  get(): string {
    return localStorage.getItem(KEY);
  }

  save(backendName: string) {
    localStorage.setItem(KEY, backendName);
  }
}
