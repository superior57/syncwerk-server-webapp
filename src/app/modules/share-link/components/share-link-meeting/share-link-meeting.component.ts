import { Component, OnInit } from '@angular/core';
import { Router, ActivatedRoute } from '@angular/router';

import { MeetingsService, NotificationService, NonAuthenticationService, I18nService } from '@services/index';

import { TranslateService } from '@ngx-translate/core';

@Component({
  selector: 'app-share-link-meeting',
  templateUrl: './share-link-meeting.component.html',
  styleUrls: ['./share-link-meeting.component.scss']
})
export class ShareLinkMeetingComponent implements OnInit {

  allowRetryToGetLogo = true;
  logoURL = '';

  isProcessing = false;
  isJoiningMeeting = false;
  isMeetingNotStarted = false;

  isError = false;
  errorMessage = '';

  meetingInfo: any = {};
  meetingToken = ''

  fullName = '';
  joinPassword = '';
  acceptTerms = false;

  settings: any = {};

  choosenLanguage = ''

  constructor(
    private meetingsService: MeetingsService,
    private router: Router,
    private activatedRoute: ActivatedRoute,
    private notify: NotificationService,
    private translate: TranslateService,
    private nonAuthentication: NonAuthenticationService,
    private i18nService: I18nService,
  ) { }

  ngOnInit() {
    this.choosenLanguage = this.i18nService.getLanguage();
    this.activatedRoute.params.subscribe(params => {
      if (!params.token || params.token.trim() === "") {
        this.isError = true;
        this.errorMessage = 'Invalid token';
      } else {
        const settingKeys = [
          'REGISTRATION_SEND_MAIL',
          'ACTIVATE_AFTER_REGISTRATION',
          'REGISTER_PAGE_TERM_AND_CONDITION_CHECKBOX_TEXT_EN',
          'REGISTER_PAGE_TERM_AND_CONDITION_CHECKBOX_TEXT_DE',
        ];
        this.nonAuthentication.getSettingsByKeys(settingKeys.join(',')).subscribe(resp => {
          this.settings = resp.data.config_dict;
          this.meetingToken = params.token;
          this.getMeetingInfo(params.token);
        });
      }
    });
  }

  getMeetingInfo(meetingToken) {
    this.isProcessing = true;
    this.isError = false;
    this.meetingsService.getMeetingInfoBySharingToken(meetingToken).subscribe(resp => {
      this.meetingInfo = resp.data;
      this.isError = false;
      this.isProcessing = false;
      this.errorMessage = '';
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.errorMessage = errorBody.message;
      this.isError = true;
      this.isProcessing = false;
      // this.notify.showNotification('danger', errorBody.message);
    });
  }

  submitJoinMeeting() {
    if (!this.acceptTerms) {
      this.notify.showNotification('danger', this.translate.instant('MEETING.PUBLIC_LINK_PAGE.MUST_ACCEPT_TERMS'));
      return false;
    }
    if (/^[a-zA-Z0-9 ]*$/.test(this.fullName) === false) {
      this.notify.showNotification('danger', this.translate.instant('MEETING.PUBLIC_LINK_PAGE.FULL_NAME_FORMAT_ERROR'));
      return false;
    }
    if (this.fullName.trim().length > 150) {
      this.notify.showNotification('danger', this.translate.instant('MEETING.PUBLIC_LINK_PAGE.FULL_NAME_LENGTH_ERROR'));
      return false;
    }
    this.joinMeeting(this.meetingToken, this.fullName, this.joinPassword);
  }

  joinMeeting(meetingToken, fullName, joinPassword = '') {
    this.isJoiningMeeting = true;
    this.meetingsService.postJoinMeeting(fullName, joinPassword, meetingToken).subscribe(resp => {
      if (resp.data.success) {
        window.location.href = resp.data.join_url;
      } else {
        this.isMeetingNotStarted = true;
        this.isJoiningMeeting = true;
        setTimeout(() => {
          this.joinMeeting(meetingToken, fullName, joinPassword);
        }, 5000);
      }
    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
      this.isProcessing = false;
      this.isError = false;
      this.isJoiningMeeting = false;
      // this.errorMessage = errorBody.message;
      // this.isError = true;
      // this.isProcessing = false;
    });
  }

  logoErrorHandler(event) {
    // use default logo in the client app (only retry once)
    if (this.allowRetryToGetLogo === true) {
      this.allowRetryToGetLogo = false;
      this.logoURL = `/media/img/syncwerk-logo.png?r=${new Date().getTime()}`;
    }
  }

}
