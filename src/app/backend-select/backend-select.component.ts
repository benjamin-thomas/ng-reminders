import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {BackendSelectService} from './service/backend-select.service';
import {Router} from '@angular/router';

@Component({
  selector: 'app-backend-select',
  templateUrl: './backend-select.component.html',
  styleUrls: ['./backend-select.component.scss']
})
export class BackendSelectComponent {
  form = new FormGroup({
    backendName: new FormControl(this.backendSelectService.get(), Validators.required),
  });

  options: { value: string, name: string }[] = [
    {value: null, name: '---'},
    {value: 'golang-gin', name: 'Golang/Gin (TODO)'},
    {value: 'golang-stdlib', name: 'Golang/Std lib (TODO)'},
    {value: 'java-springboot', name: 'Java/Spring boot (TODO)'},
    {value: 'node-express', name: 'Node/Express (TODO)'},
    {value: 'postgrest', name: 'PostgRest'},
  ];

  constructor(private backendSelectService: BackendSelectService,
              private router: Router) {
  }

  onSubmit() {
    if (this.form.invalid) {
      alert('Invalid input');
      return;
    }

    this.backendSelectService.save(this.form.value.backendName);
    this.router.navigate(['']);
  }
}
