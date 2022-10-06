import { Directive, ElementRef, HostListener } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

@Directive({
  selector: '[routeTransformer]'
})
export class RouteTransformerDirective {

  constructor(private el: ElementRef, private router: Router, private activatedRoute: ActivatedRoute) { }

  @HostListener('click', ['$event'])
  public onClick(event) {
    console.log('this is activated route', this.activatedRoute);
    if (event.target.tagName === 'A') {
      console.log('this is target url', event.target.getAttribute('href'));
      const urlArr = event.target.getAttribute('href').split('#');
      console.log(urlArr);
      if (urlArr[1] === 'custom') {
        event.preventDefault();
        if (urlArr[2] === 'false') {
          window.location.href = urlArr[0];
        } else {
          window.open(urlArr[0], '_blank');
        }
      } else if (urlArr[1] === 'existingPage') {
        event.preventDefault();
        if (this.activatedRoute.routeConfig.data && this.activatedRoute.routeConfig.data.name === 'public-share-file-preview') {
          this.activatedRoute.params.subscribe((params) => {
            console.log(params.token);
            this.router.navigate(['/share-link', 'd', params.token, 'files'], {
              queryParams: {
                p: urlArr[3],
              },
            });
          });
        } else {
          this.router.navigate(['/preview', urlArr[2]], {
            queryParams: {
              p: urlArr[3],
            }
          });
        }
      }
    } else {
      return;
    }
  }

};
