import {PostgrestBackend} from './postgrest-backend';
import {NodeExpressBackend} from './node-express-backend';
import {Backend} from './backend.model';
import {GolangGinBackend} from './golang-gin-backend';

export type BackendNames = 'PostgREST'
  | 'Golang/Gin'
  | 'Node/Express' ;

function enforceSwitchComplete(x: never) {
  throw new Error(x);
}

export class BackendFactory {

  static availables: BackendNames[] = [
    'PostgREST',
    'Node/Express',
    'Golang/Gin',
  ];

  static create(name: BackendNames, host: string): Backend {
    switch (name) {
      case 'PostgREST':
        return new PostgrestBackend(host);
      case 'Node/Express':
        return new NodeExpressBackend(host);
      case 'Golang/Gin':
        return new GolangGinBackend(host)
    }

    enforceSwitchComplete(name);
  }
}
