import {
  AfterViewInit,
  Component,
  ElementRef,
  EventEmitter,
  HostListener,
  Input,
  Output,
  ViewChild
} from '@angular/core';
import {FormGroup} from '@angular/forms';

@Component({
  selector: 'app-reminder-form',
  templateUrl: './reminder-form.component.html',
  styleUrls: ['./reminder-form.component.scss']
})
export class ReminderFormComponent implements AfterViewInit {
  @Input() form: FormGroup;
  @Input() title: string;
  @Output() handleValidSubmit = new EventEmitter();
  @ViewChild('content') content: ElementRef;

  ngAfterViewInit(): void {
    this.content.nativeElement.focus();
  }

  @HostListener('document:keydown.control.enter')
  onSubmit() {
    if (!this.form.valid) {
      return;
    }
    this.handleValidSubmit.emit();
  }
}
