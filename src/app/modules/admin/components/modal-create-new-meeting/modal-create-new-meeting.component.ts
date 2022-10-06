import { Component, OnInit, ViewChild, ElementRef, Renderer2, Output, EventEmitter } from '@angular/core';
import { map } from 'rxjs/operators';
import { Observable } from 'rxjs';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NotificationService, AdminService, NonAuthenticationService } from 'app/services';

import * as _ from 'lodash';

@Component({
  selector: 'app-modal-create-new-meeting',
  templateUrl: './modal-create-new-meeting.component.html',
  styleUrls: ['./modal-create-new-meeting.component.scss']
})
export class ModalCreateNewMeetingComponent implements OnInit {

  @ViewChild('meetingName') private meetingNameElement: ElementRef;
  @ViewChild('modMeetingPIN') private modPinElement: ElementRef;
  @ViewChild('attendeeMeetingPIN') private attendeePinElement: ElementRef;
  @ViewChild('maxParticipants') private maxParticipantsElement: ElementRef;
  @Output() fileChooserEvent = new EventEmitter<any>()

  isEdit = false;
  meetingId = 0;
  isProcessing = false;
  addMeetingForm: FormGroup;
  owner = '';
  serverList = [];
  meetingInfoToEdit: any = {};
  files = [];
  globalAllowMeeting = false;
  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private notify: NotificationService,
    private adminService: AdminService,
    public bsModalRef: BsModalRef,
    private renderer: Renderer2,
    private nonAuth: NonAuthenticationService,
  ) { }

  ngOnInit() {
    this.initAddMeetingForm();
    this.nonAuth.getSettingsByKeys('BBB_ALLOW_MEETING_RECORDINGS').subscribe(settingResp => {
      this.adminService.getInitAddEditMeetingModal().subscribe(resp => {
        this.serverList = resp.data.bbb_servers;
        if (this.isEdit == true) {
          this.initEditMeetingForm();
        }
      });
    })
  }

  initAddMeetingForm() {
    this.addMeetingForm = this.formBuilder.group({
      meetingName: [''],
      pinModerator: [''],
      pinAttendees: [''],
      muteParticipants: [''],
      moderatorApproval: [''],
      allowUserStart: [''],
      usersJoinAsModerator: [''],
      allowRecording: [''],
      maxParticipants: [''],
      welcomeMessage: [''],
      roomOwner: [''],
      requirePasswordToJoin: [''],
      allowStreaming: [''],
      allowStreamingFeedback: [''],
      privateSetting: [-1]
    });
    this.handleFormChange();
  }

  initEditMeetingForm() {
    this.adminService.getMeetingById(this.meetingId).subscribe(resp => {
      const data = resp.data;
      this.meetingInfoToEdit = resp.data;
      this.addMeetingForm.controls['meetingName'].setValue(data.room_name);
      this.addMeetingForm.controls['pinModerator'].setValue(data.moderator_pw);
      this.addMeetingForm.controls['pinAttendees'].setValue(data.attendee_pw);
      this.addMeetingForm.controls['muteParticipants'].setValue(data.mute_participants_on_join);
      this.addMeetingForm.controls['moderatorApproval'].setValue(data.require_mod_approval);
      this.addMeetingForm.controls['allowUserStart'].setValue(data.allow_any_user_start);
      this.addMeetingForm.controls['usersJoinAsModerator'].setValue(data.all_users_join_as_mod);
      this.addMeetingForm.controls['allowRecording'].setValue(data.allow_recording);
      this.addMeetingForm.controls['maxParticipants'].setValue(data.max_number_of_participants);
      this.addMeetingForm.controls['welcomeMessage'].setValue(data.welcome_message);
      this.addMeetingForm.controls['roomOwner'].setValue(data.room_owner);
      this.addMeetingForm.controls['requirePasswordToJoin'].setValue(data.require_meeting_password);
      this.addMeetingForm.controls['privateSetting'].setValue(data.private_setting);
      this.addMeetingForm.controls['allowStreaming'].setValue(data.live_stream_active);
      this.addMeetingForm.controls['allowStreamingFeedback'].setValue(data.live_stream_feedback_active);
      this.owner = data.owner_id;
      this.files = data.files;
      if (data.room_name != '') {
        this.renderer.addClass(this.meetingNameElement.nativeElement, 'form-control--active');
      }
      if (data.moderator_pw != '') {
        this.renderer.addClass(this.modPinElement.nativeElement, 'form-control--active');
      }
      if (data.attendee_pw != '') {
        this.renderer.addClass(this.attendeePinElement.nativeElement, 'form-control--active');
      }
      if (data.max_number_of_participants !== '') {
        this.renderer.addClass(this.maxParticipantsElement.nativeElement, 'form-control--active');
      }

    }, err => {
      const errorBody = JSON.parse(err._body);
      this.notify.showNotification('danger', errorBody.message);
      this.bsModalRef.hide();
    });
  }

  addMeeting() {
    const meetingName = this.addMeetingForm.value.meetingName;
    if (meetingName.trim() === '' || meetingName === null || meetingName === undefined) {
      this.notify.showNotification('danger', this.translate.instant('MEETING.FORM.MEETING_NAME_INVALID'));
      return false;
    }
    this.isProcessing = true;
    const newMeetingInfo = {
      meetingName: meetingName,
      pinModerator: this.addMeetingForm.value.pinModerator,
      pinAttendees: this.addMeetingForm.value.pinAttendees,
      muteParticipants: this.addMeetingForm.value.muteParticipants,
      moderatorApproval: this.addMeetingForm.value.moderatorApproval,
      allowUserStart: this.addMeetingForm.value.allowUserStart,
      usersJoinAsModerator: this.addMeetingForm.value.usersJoinAsModerator,
      allowRecording: this.addMeetingForm.value.allowRecording,
      maxParticipants: this.addMeetingForm.value.maxParticipants || 0,
      welcomeMessage: this.addMeetingForm.value.welcomeMessage,
      roomOwner: this.addMeetingForm.value.roomOwner,
      privateSetting: this.addMeetingForm.value.privateSetting,
      requirePasswordToJoin: this.addMeetingForm.value.requirePasswordToJoin,
      allowStreaming: this.addMeetingForm.value.allowStreaming,
      allowStreamingFeedback: this.addMeetingForm.value.allowStreamingFeedback,
      files: this.files
    };
    if (this.isEdit == true) {
      this.adminService.postEditMeeting(this.meetingId, newMeetingInfo).subscribe(resp => {
        this.notify.showNotification('success', resp.message);
        this.bsModalRef.hide();
      }, err => {
        const errorBody = JSON.parse(err._body);
        this.notify.showNotification('danger', errorBody.message);
        this.isProcessing = false;
      });

    } else {
      this.adminService.postCreateNewMeeting(newMeetingInfo).subscribe(resp => {
        this.notify.showNotification('success', resp.message);
        this.bsModalRef.hide();
      }, err => {
        const errorBody = JSON.parse(err._body);
        this.notify.showNotification('danger', errorBody.message);
        this.isProcessing = false;
      });

    }
  }

  generatePin(pinType: string) {
    const randomPin = this.randomString();
    switch (pinType) {
      case 'moderator':
        this.addMeetingForm.controls['pinModerator'].setValue(randomPin);
        this.renderer.addClass(this.modPinElement.nativeElement, 'form-control--active');
        break;
      case 'attendees':
        this.addMeetingForm.controls['pinAttendees'].setValue(randomPin);
        this.renderer.addClass(this.attendeePinElement.nativeElement, 'form-control--active');
        break;
    }
  }

  randomString() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 8; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  public autocompleteUserList = (text: string): Observable<any> => {
    return this.adminService.getSearchUser(text).pipe(map(result => {
      return result.data.users.map(user => {
        return {
          display: this.handleNameUserList(user.name, user.email),
          value: user.email,
          templateData: user,
        };
      });
    }));
  }

  public autoCompleteUserListMatching = (value, target): boolean => {
    return true;
  }


  handleNameUserList(nameStr: string, email: string, limitStr: number = 35) {
    let name;
    if (nameStr !== '') {
      name = nameStr.length > limitStr ? nameStr.slice(0, limitStr) + '...' : nameStr;
    } else {
      const tmpName = email.split('@')[0];
      name = tmpName.length > limitStr ? tmpName.slice(0, limitStr) + '...' : tmpName;
    }
  }

  handleFormChange() {
    this.addMeetingForm.get('privateSetting').valueChanges.subscribe(data => {
      console.log('formData', data);
      if (data === -1 || data === '-1') {
        this.addMeetingForm.controls['roomOwner'].enable();
      } else {
        this.addMeetingForm.controls['roomOwner'].disable();
        const selectedSettings = _.find(this.serverList, { id: parseInt(data) })
        if (selectedSettings) {
          this.addMeetingForm.controls['roomOwner'].setValue(selectedSettings.owner_email, { emitEvent: false });
        }
      }
    });
  }

  choosePresentationFile() {
    this.fileChooserEvent.emit();
  }

  removeFile(file) {
    const fileIndex = this.files.findIndex(f => f === file);
    if (fileIndex > -1) {
      this.files.splice(fileIndex, 1);
    }
  }

  closeModal() {
    this.bsModalRef.hide();
  }
}
