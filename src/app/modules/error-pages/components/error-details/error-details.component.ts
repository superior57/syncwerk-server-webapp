import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';
import { OtherService, I18nService } from '@services/index';

@Component({
  selector: 'app-error-details',
  templateUrl: './error-details.component.html',
  styleUrls: ['./error-details.component.scss']
})
export class ErrorDetailsComponent implements OnInit {

  @Input() errorCode = '404';
  @Input() errorMessage = 'Page not found';

  returnToHomeMessage = '';

  constructor(
    private router: Router,
    private otherService: OtherService,
    private i18nService: I18nService,
  ) { }

  ngOnInit() {
    this.setDefaultLanguage();
  }

  setDefaultLanguage() {
    const lang = this.i18nService.getLanguage();
    if (lang === 'de') {
      this.returnToHomeMessage = 'Zurück zur Startseite';
    } else {
      this.returnToHomeMessage = 'Back to homepage';
    }
  }

  returnToHome() {
    this.otherService.getHealthCheck().subscribe(resp => {
      this.router.navigate(['/']);
    }, err => {
      if (err.status === 502) {
        this.router.navigate(['/error', '502']);
      }
    });
  }

}
