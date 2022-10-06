import { Component, OnInit, Input, ViewChild, ElementRef, Output, EventEmitter } from '@angular/core';
import { AdminService, FilesService, AuthenticationService, MessageService, NotificationService } from 'app/services';
import { Type, Action } from '@enum/index.enum';
import { TranslateService } from '@ngx-translate/core';


@Component({
  selector: 'app-useradmin-info-profiles',
  templateUrl: './useradmin-info-profiles.component.html',
  styleUrls: ['./useradmin-info-profiles.component.scss']
})
export class UseradminInfoProfilesComponent implements OnInit {

  @Input() dataProfiles: any;
  @Output() updatedReloadData = new EventEmitter;

  @ViewChild('name') nameEle: ElementRef;
  @ViewChild('loginID') loginIDEle: ElementRef;
  @ViewChild('department') departmentEle: ElementRef;
  @ViewChild('quota') quotaEle: ElementRef;
  @ViewChild('maxMeetings') maxMeetingsEle: ElementRef;

  display: any;
  model = {
    name: '',
    login_id: '',
    department: '',
    quota: '',
    max_meetings: ''
  };
  show_button = {
    change_profile: true,
    submit_yes_no: false,
  };
  isProcessing = false;
  linkAvatarEmail: string;
  params: any;
  getDetailUserInfo = '';

  currentUserPermission: any = {
    can_manage_user: false,
  };

  constructor(
    private adminService: AdminService,
    private filesServive: FilesService,
    private authService: AuthenticationService,
    private messageService: MessageService,
    private authenService: AuthenticationService,
    private NotificationService: NotificationService,
    private TranslateService: TranslateService,
  ) { }

  ngOnInit() {
    this.authService.userInfo().subscribe(resp => {
      this.currentUserPermission = resp.data.permissions;
      this.getUserInfo();
    });
  }

  async changeDisplay(display: string) {
    this.display = await this.delayDisplay(display);
    await this.autoFocus();
  }

  delayDisplay(display: string) {
    return new Promise((resolve) => resolve(display));
  }

  getUserInfo() {
    this.authenService.userWithAvatarInfo().subscribe(resp => {
      this.getDetailUserInfo = resp.data;
    });
  }

  autoFocus() {
    return new Promise((resolve) => setTimeout(() => {
      if (this.display === 'name') {
        this.nameEle.nativeElement.value = this.dataProfiles.profile.nickname;
        const lengthValue = this.nameEle.nativeElement.value.length;
        this.nameEle.nativeElement.setSelectionRange(0, lengthValue);
        this.nameEle.nativeElement.focus();
      } else if (this.display === 'login_id') {
        this.loginIDEle.nativeElement.value = this.dataProfiles.profile.login_id;
        const lengthValue = this.loginIDEle.nativeElement.value.length;
        this.loginIDEle.nativeElement.setSelectionRange(0, lengthValue);
        this.loginIDEle.nativeElement.focus();
      } else if (this.display === 'department') {
        this.departmentEle.nativeElement.value = this.dataProfiles.d_profile.department;
        const lengthValue = this.departmentEle.nativeElement.value.length;
        this.departmentEle.nativeElement.setSelectionRange(0, lengthValue);
        this.departmentEle.nativeElement.focus();
      } else if (this.display === 'storage') {
        this.quotaEle.nativeElement.value = this.dataProfiles.space_quota === -2 ? 0 : this.dataProfiles.space_quota / 1000000;
        this.quotaEle.nativeElement.focus();
      } else if (this.display === 'max_meetings') {
        this.maxMeetingsEle.nativeElement.value = this.dataProfiles.p_setting.max_meetings;
        const lengthValue = this.maxMeetingsEle.nativeElement.value.length;
        this.maxMeetingsEle.nativeElement.setSelectionRange(0, lengthValue);
        this.maxMeetingsEle.nativeElement.focus();
      } else {
        return;
      }
      resolve();
    }));
  }

  submitEditProfile() {
    this.changeDisplay('');
    const formData = this.handleDataEditSubmit();
    this.adminService.putCreateUpdateAccount(this.dataProfiles.email, formData).subscribe(
      resps => {
        this.updatedReloadData.emit({ message_success: resps.message });
      }, error => {
        if (error.status === 400) {
          this.NotificationService.showNotification('danger', this.TranslateService.instant('LOGIN.LABEL.LOGIN_ID_ALREADY_USED'));
        }
        console.error('useradmin info profiles: ', error);
      });
  }

  handleDataEditSubmit() {
    if (this.display === 'name') {
      return { name: this.model.name === '' ? this.nameEle.nativeElement.value : this.model.name };
    } else if (this.display === 'login_id') {
      return { login_id: this.model.login_id === '' ? this.loginIDEle.nativeElement.value : this.model.login_id };
    } else if (this.display === 'department') {
      return { department: this.model.department === '' ? this.departmentEle.nativeElement.value : this.model.department };
    } else if (this.display === 'storage') {
      return { storage: this.model.quota === '' ? this.quotaEle.nativeElement.value : this.model.quota };
    } else if (this.display === 'max_meetings') {
      return { max_meetings: this.model.max_meetings === '' ? this.maxMeetingsEle.nativeElement.value : this.model.max_meetings };
    }
  }
}
