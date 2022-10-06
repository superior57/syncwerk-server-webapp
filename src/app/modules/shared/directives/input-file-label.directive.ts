import { Directive, ElementRef, HostListener, Input } from '@angular/core';
import { Element } from '@angular/compiler';

@Directive({
  selector: '[appInputFileLabel]'
})
export class InputFileLabelDirective {

  @Input() canChangeFileName: boolean;

  constructor(
    private el: ElementRef
  ) { }

  @HostListener('change') onChange() {
    if (this.canChangeFileName) {
      const label = this.el.nativeElement.nextElementSibling;
      const fileName = this.el.nativeElement.value.split('\\').pop();
      label.innerHTML = fileName ? this.cutFileName(fileName) : 'Choose a file';
    }
  }

  cutFileName(name: string) {
    return name.length >= 25 ? name.substring(0, 21) + '...' : name;
  }
}
