import {PostgrestBackend} from './postgrest-backend';

const HOST = 'http://localhost:3333';

describe('PostgrestBackend', () => {
  let b: PostgrestBackend;

  beforeEach(() => {
    b = new PostgrestBackend(HOST);
  });

  it('should create an instance', () => {
    expect(b).toBeTruthy();
  });

  it('should know the login URL', () => {
    expect(b.loginURL()).toEqual(HOST + '/rpc/login');
  });

  it('should know the signup URL', () => {
    expect(b.signupURL()).toEqual(HOST + '/rpc/signup');
  });

  it('should generate URLs for a single reminder', () => {
    expect(b.reminderURL(1)).toEqual(HOST + '/reminders?id=eq.1');
    expect(b.reminderURL(2)).toEqual(HOST + '/reminders?id=eq.2');
    expect(b.reminderURL(99)).toEqual(HOST + '/reminders?id=eq.99');

    expect(() => b.reminderURL(null)).toThrow(PostgrestBackend.InvalidInputError);
    expect(() => b.reminderURL(0)).toThrow(PostgrestBackend.InvalidInputError);
  });

  it('should generate URLs for multiple reminders', () => {
    expect(b.remindersURL()).toEqual(HOST + '/reminders');

    expect(b.remindersURL([1])).toEqual(HOST + '/reminders?id=eq.1');
    expect(b.remindersURL([2])).toEqual(HOST + '/reminders?id=eq.2');
    expect(b.remindersURL([1, 2])).toEqual(HOST + '/reminders?or=(id.eq.1,id.eq.2)');

    expect(() => b.remindersURL([])).toThrow(PostgrestBackend.InvalidInputError);
  });

  it('should handle sorting', () => {
    expect(b.remindersSortURL()).toEqual(HOST + '/reminders?order=due.asc,id.desc');
  });

});
