import { Directive, ElementRef, Renderer, OnInit } from '@angular/core';

@Directive({
  selector: '[appFormControlFloat]',
  host: { '(blur)': 'onBlur()' }
})
export class FormControlFloatDirective implements OnInit {

  elem: any = this.el.nativeElement;

  constructor(
    private el: ElementRef,
    private renderer: Renderer
  ) { }

  onBlur() {
    const status = true ? this.elem.value : false;
    this.renderer.setElementClass(this.elem, 'form-control--active', status);
  }

  ngOnInit() {
    if (this.elem.value) {
      this.renderer.setElementClass(this.elem, 'form-control--active', true);
    }
  }

}
