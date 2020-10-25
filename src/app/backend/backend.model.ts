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
  isValid = false;

  constructor(private value) {
    if (!this._hasValidValue()) {
      this.displayName = 'NOT_FOUND';
      return;
    }

    this.isValid = true;
    this.displayName = Backend.formOptions.find(opt => {
      return opt.value === value;
    }).name;
  }

  private _hasValidValue(): boolean {
    return Backend.formOptions
      .filter(option => option.name !== NONE)
      .map(option => option.value)
      .includes(this.value);
  }

}
