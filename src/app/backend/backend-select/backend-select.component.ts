import {Component, OnInit} from '@angular/core';
import {FormControl, FormGroup, Validators} from '@angular/forms';
import {BackendSelectService} from './service/backend-select.service';
import {Router} from '@angular/router';
import {BackendFactory} from '../backend-factory';
import {take} from 'rxjs/operators';

@Component({
  selector: 'app-backend-select',
  templateUrl: './backend-select.component.html',
  styleUrls: ['./backend-select.component.scss']
})
export class BackendSelectComponent implements OnInit {
  form = new FormGroup({
    backend: new FormControl('', Validators.required),
  });
  backends = BackendFactory.availables;

  constructor(private backendSelectService: BackendSelectService,
              private router: Router) {
  }

  ngOnInit(): void {
    this.backendSelectService.emitter.pipe(take(1)).subscribe(([, backendName]) => {
      this.form.controls.backend.setValue(backendName);
    });
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
