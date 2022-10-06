import { Component, OnInit, Input, AfterViewInit } from '@angular/core';
import { NotificationService, I18nService, MeetingsService, AdminService, NonAuthenticationService, AuthenticationService } from '@services/index';
import { ActivatedRoute, Router } from '@angular/router';
import { CookieService } from 'ngx-cookie';
import { Select2OptionData } from 'ng2-select2';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import videojs from 'video.js';

@Component({
  selector: 'app-share-meeting-stream',
  templateUrl: './share-meeting-stream.component.html',
  styleUrls: ['./share-meeting-stream.component.scss']
})
export class ShareMeetingStreamComponent implements OnInit, AfterViewInit {
  public vjs: videojs.Player;

  @Input() token: string;

  logoURL = '';
  logoTooltip = '';
  streamLink = '';
  feedbackEnabled = false;
  isProcessing = false;
  feedbackForm: FormGroup;
  hasError = false;
  allowRetryToGetLogo = true;
  isPageNotFound = false;

  select2TranslateData: Array<Select2OptionData> = [
    { id: 'en', text: 'English' },
    { id: 'de', text: 'Deutsch' },
  ];
  translateOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
  };
  choosenLanguage = 'en';

  constructor(
    private notiService: NotificationService,
    private i18nService: I18nService,
    private translate: TranslateService,
    private route: ActivatedRoute,
    private router: Router,
    private formBuilder: FormBuilder,
    private notify: NotificationService,
    private nonAuthenService: NonAuthenticationService,
    private authService: AuthenticationService,
    private cookieService: CookieService,
    private adminService: AdminService,
    private meetingsServices: MeetingsService,
  ) {
      this.route.params.subscribe(params => {
        this.token = params['token'];
      });
  }

  ngOnInit() {
    this.initFeedbackForm();
    this.getLogoURL();
    this.getLogoTooltip();
    this.choosenLanguage = this.i18nService.getLanguage();
    this.translate.use(this.choosenLanguage);
  }

  initFeedbackForm() {
    this.feedbackForm = this.formBuilder.group({
      username: [''],
      email: [''],
      message: [''],
    });
  }

  ngAfterViewInit() {
    this.meetingsServices.getMeetingLiveStreamInfo(this.token).subscribe(resp => {
        this.streamLink = resp.data.stream_link;
        this.feedbackEnabled = resp.data.feedback_enabled;

        const options = {
          'sources' : [{
            'src' : this.streamLink,
            'type' : 'application/x-mpegURL'
            }
          ],
        };

        this.vjs = videojs('my-player', options);
      });

  }

  logoErrorHandler(event) {
    // use default logo in the client app (only retry once)
    if (this.allowRetryToGetLogo === true) {
      this.allowRetryToGetLogo = false;
      this.logoURL = `/media/img/syncwerk-logo.png?r=${new Date().getTime()}`;
    }
  }

  switchLanguage(data: { value: string }) {
    this.i18nService.setLanguage(data.value);
    this.translate.use(data.value);
  }

  getLogoURL() {
    this.logoURL = this.nonAuthenService.getPageLogoLink();
  }

  getLogoTooltip() {
    this.adminService.getRestapiSettingsByKeys('SITE_TITLE').subscribe(resp => {
      this.logoTooltip = resp.data.config_dict.SITE_TITLE;
      if (this.logoTooltip === '') {
        this.logoTooltip = `Syncwerk Web-App`;
      }
    });
  }

  submitFeedback() {
    this.hasError = false;
    const username = this.feedbackForm.value.username;
    const email = this.feedbackForm.value.email;
    const message = this.feedbackForm.value.message;
    if (username.trim() === '' || username === null || username === undefined) {
      this.hasError = true;
    }
    if (email.trim() === '' || email === null || email === undefined) {
      this.hasError = true;
    }
    if (message.trim() === '' || message === null || message === undefined) {
      this.hasError = true;
    }

    if (this.hasError === true) {
      this.notify.showNotification('danger', this.translate.instant('MEETING.FORM.FEEDBACK_INVALID'));
        return false;
    }

    this.isProcessing = true;
    let newFeedbackInfo = {};

    newFeedbackInfo = {
      username: this.feedbackForm.value.username,
      email: this.feedbackForm.value.email,
      message: this.feedbackForm.value.message,
    };

    this.meetingsServices.postStreamMeetingFeedback(this.token, newFeedbackInfo).subscribe(resp => {
      this.notify.showNotification('success', resp.message);
      this.initFeedbackForm();
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
    });

    this.isProcessing = false;
  }
}
