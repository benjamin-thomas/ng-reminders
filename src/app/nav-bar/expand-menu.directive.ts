import {Directive, HostBinding, HostListener} from '@angular/core';

@Directive({
  selector: '[appExpandMenu]'
})
export class ExpandMenuDirective {

  @HostBinding('class.open') isOpen = false;
  @HostListener('click') toggleOpen() {
    this.isOpen = !this.isOpen;
  }

  constructor() {
  }


}
