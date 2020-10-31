import {BackendFactory} from './backend-factory';
import {PostgrestBackend} from './postgrest-backend';

fdescribe('BackendFactory', () => {

  it('should create an instance', () => {
    expect(new BackendFactory()).toBeTruthy();
  });

  it('should instanciate a PostgREST backend', () => {
    expect(BackendFactory.create('PostgREST', 'http://localhost:1234')).toBeInstanceOf(PostgrestBackend);
  });

});
