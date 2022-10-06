import { Component, OnInit, ViewChild, ElementRef, Renderer2, Output, EventEmitter } from '@angular/core';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { NotificationService, MeetingsService, NonAuthenticationService } from 'app/services';

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
  meetingRole = 'OWNER';
  meetingId = 0;
  isProcessing = false;
  addMeetingForm: FormGroup;
  privateSettingSelect = [];
  meetingInfoToEdit: any = {};
  files = [];
  globalAllowMeeting = false;
  constructor(
    private formBuilder: FormBuilder,
    private translate: TranslateService,
    private notify: NotificationService,
    private meetingsService: MeetingsService,
    public bsModalRef: BsModalRef,
    private renderer: Renderer2,
    private nonAuth: NonAuthenticationService,
  ) { }

  ngOnInit() {
    this.initAddMeetingForm();
    this.nonAuth.getSettingsByKeys('BBB_ALLOW_MEETING_RECORDINGS').subscribe(settingResp => {
      if(settingResp.data.config_dict.BBB_ALLOW_MEETING_RECORDINGS) {
        this.globalAllowMeeting = true;
      } else {
        this.globalAllowMeeting = false;
      }
      this.meetingsService.getListPrivateSetting().subscribe(response => {
        this.privateSettingSelect = response.data;
        if (this.isEdit == true) {
          this.initEditMeetingForm();
        } else {
          setTimeout(() => {
            this.addMeetingForm.controls['privateSetting'].setValue(-1);
          }, 100)
        }
      }, err => {
        const errorBody = JSON.parse(err._body);
        this.notify.showNotification('danger', errorBody.message);
        this.isProcessing = false;
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
      requirePasswordToJoin: [''],
      allowStreaming: [''],
      allowStreamingFeedback: [''],
      maxParticipants: [{value: '', disabled: this.meetingRole !== 'OWNER'}],
      welcomeMessage: [{value: '', disabled: this.meetingRole !== 'OWNER'}],
      privateSetting: [-1]
    });
  }

  initEditMeetingForm() {
    this.meetingsService.getMeetingById(this.meetingId).subscribe(resp => {
      const data = resp.data;
      this.meetingInfoToEdit = data;
      console.log(this.meetingInfoToEdit);
      this.addMeetingForm.controls['meetingName'].setValue(data.room_name);
      this.addMeetingForm.controls['pinModerator'].setValue(data.moderator_pw);
      this.addMeetingForm.controls['pinAttendees'].setValue(data.attendee_pw);
      this.addMeetingForm.controls['muteParticipants'].setValue(data.mute_participants_on_join);
      this.addMeetingForm.controls['moderatorApproval'].setValue(data.require_mod_approval);
      this.addMeetingForm.controls['allowUserStart'].setValue(data.allow_any_user_start);
      this.addMeetingForm.controls['usersJoinAsModerator'].setValue(data.all_users_join_as_mod);
      this.addMeetingForm.controls['allowRecording'].setValue(data.allow_recording);
      this.addMeetingForm.controls['maxParticipants'].setValue(data.max_number_of_participants);
      this.addMeetingForm.controls['welcomeMessage'].setValue(data.welcome_message || '');
      this.addMeetingForm.controls['requirePasswordToJoin'].setValue(data.require_meeting_password);
      this.addMeetingForm.controls['allowStreaming'].setValue(data.live_stream_active);
      this.addMeetingForm.controls['allowStreamingFeedback'].setValue(data.live_stream_feedback_active);
      setTimeout(() => {
        this.addMeetingForm.controls['privateSetting'].setValue(data.private_setting);
      }, 100)
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
      if (data.status === 'IN_PROGRESS') {
        this.addMeetingForm.controls['pinModerator'].disable();
        this.addMeetingForm.controls['pinAttendees'].disable();
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

    let newMeetingInfo = {};

    if (!this.isEdit) {
      newMeetingInfo = {
        meetingName: meetingName,
        pinModerator: this.addMeetingForm.value.pinModerator,
        pinAttendees: this.addMeetingForm.value.pinAttendees,
        muteParticipants: this.addMeetingForm.value.muteParticipants,
        moderatorApproval: this.addMeetingForm.value.moderatorApproval,
        allowUserStart: this.addMeetingForm.value.allowUserStart,
        usersJoinAsModerator: this.addMeetingForm.value.usersJoinAsModerator,
        allowRecording: this.addMeetingForm.value.allowRecording,
        maxParticipants: this.addMeetingForm.value.maxParticipants || 0,
        welcomeMessage: this.addMeetingForm.value.welcomeMessage || '',
        privateSetting: this.addMeetingForm.value.privateSetting,
        requirePasswordToJoin: this.addMeetingForm.value.requirePasswordToJoin,
        allowStreaming: this.addMeetingForm.value.allowStreaming,
        allowStreamingFeedback: this.addMeetingForm.value.allowStreamingFeedback,
        files: this.files
      };
    } else {
      newMeetingInfo = {
        meetingName: meetingName,
        pinModerator: this.meetingInfoToEdit.status === 'IN_PROGRESS' ? this.meetingInfoToEdit.moderator_pw : this.addMeetingForm.value.pinModerator,
        pinAttendees: this.meetingInfoToEdit.status === 'IN_PROGRESS' ? this.meetingInfoToEdit.attendee_pw : this.addMeetingForm.value.pinAttendees,
        muteParticipants: this.addMeetingForm.value.muteParticipants,
        moderatorApproval: this.addMeetingForm.value.moderatorApproval,
        allowUserStart: this.addMeetingForm.value.allowUserStart,
        usersJoinAsModerator: this.addMeetingForm.value.usersJoinAsModerator,
        allowRecording: this.addMeetingForm.value.allowRecording,
        maxParticipants: this.addMeetingForm.value.maxParticipants || 0,
        welcomeMessage: this.addMeetingForm.value.welcomeMessage || '',
        privateSetting: this.addMeetingForm.value.privateSetting,
        requirePasswordToJoin:this.addMeetingForm.value.requirePasswordToJoin,
        allowStreaming:this.addMeetingForm.value.allowStreaming,
        allowStreamingFeedback:this.addMeetingForm.value.allowStreamingFeedback,
        files: this.files
      };
    }
    if (this.isEdit == true) {
      this.meetingsService.postEditMeeting(this.meetingId, newMeetingInfo).subscribe(resp => {
        this.notify.showNotification('success', resp.message);
        this.bsModalRef.hide();
      }, err => {
        const errorBody = JSON.parse(err._body);
        this.notify.showNotification('danger', errorBody.message);
        this.isProcessing = false;
      });
    } else {
      this.meetingsService.postCreateNewMeeting(newMeetingInfo).subscribe(resp => {
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
    if (this.isEdit && this.meetingInfoToEdit.status === "IN_PROGRESS") {
      return false;
    }
    const randomPin = this.randomString();
    switch(pinType) {
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
