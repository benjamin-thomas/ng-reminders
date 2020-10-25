import {Component} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {BackendSelectService} from './service/backend-select.service';
import {Router} from '@angular/router';
import {Backend} from '../backend.model';

@Component({
  selector: 'app-backend-select',
  templateUrl: './backend-select.component.html',
  styleUrls: ['./backend-select.component.scss']
})
export class BackendSelectComponent {
  form = new FormGroup({
    backend: new FormControl(this.backendSelectService.get(), Validators.required),
  });
  backends = Backend.available;

  constructor(private backendSelectService: BackendSelectService,
              private router: Router) {
  }

  onSubmit() {
    if (this.form.invalid) {
      alert('Invalid input');
      return;
    }

    this.backendSelectService.save(this.form.value.backend);
    this.router.navigate(['']);
  }
}
