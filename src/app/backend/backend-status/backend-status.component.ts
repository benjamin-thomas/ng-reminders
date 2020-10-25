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
  backendName: string;
  private sub: Subscription;

  constructor(private backendSelectService: BackendSelectService) {
  }

  ngOnDestroy(): void {
    console.log('Destroying: should I unsubscribe?');
    this.sub.unsubscribe();
  }

  ngOnInit(): void {

    this.sub = this.backendSelectService.backendName.subscribe(val => { // BehaviorSubject
      this.backendName = new Backend(val).displayName;
    });
  }

}
