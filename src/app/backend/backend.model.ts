const NONE = '---';

export class Backend {

  static formOptions: { value: string, name: string }[] = [
    {value: null, name: NONE},
    {value: 'golang-gin', name: 'Golang/Gin (TODO)'},
    {value: 'golang-stdlib', name: 'Golang/Std lib (TODO)'},
    {value: 'java-springboot', name: 'Java/Spring boot (TODO)'},
    {value: 'node-express', name: 'Node/Express (TODO)'},
    {value: 'postgrest', name: 'PostgREST'},
  ];
  displayName: string;

  constructor(value) {
    const found = Backend.formOptions.find(opt => {
      return opt.value === value;
    });

    if (!found) {
      throw new Error('Backend value not found, this should never happen!');
    }

    let displayName = found.name;
    if (displayName === NONE) {
      displayName = 'NONE';
    }

    this.displayName = displayName;
  }

}
