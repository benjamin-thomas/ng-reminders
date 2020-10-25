import {Component, OnDestroy, OnInit} from '@angular/core';
import {Subscription} from 'rxjs';
import {BackendSelectService} from '../backend-select/service/backend-select.service';
import {Backend} from '../backend.model';

@Component({
  selector: 'app-backend-status',
  templateUrl: './backend-status.component.html',
  styleUrls: ['./backend-status.component.scss']
})
export class BackendStatusComponent implements OnInit, OnDestroy {
  backend: Backend;
  private sub: Subscription;

  constructor(private backendSelectService: BackendSelectService) {
  }

  ngOnDestroy(): void {
    this.sub.unsubscribe();
  }

  ngOnInit(): void {

    this.sub = this.backendSelectService.emitter.subscribe(backend => { // BehaviorSubject
      this.backend = backend;
    });
  }

}
