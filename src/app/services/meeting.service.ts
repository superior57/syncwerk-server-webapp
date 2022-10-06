import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';
import { Http, Response } from '@angular/http';
import { AppConfig, FilesAPI } from '../app.config';

@Injectable()
export class MeetingsService {
  constructor(
    private http: Http,
    private appConfig: AppConfig,
    private api: FilesAPI
  ) { }

  getMeetingInfoBySharingToken(token: string) {
    const url = `meeting-rooms/by-token/${token}/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postJoinMeeting(fullName: string, joinPassword: string, token: string) {
    const url = `meeting-rooms/by-token/${token}/`;
    const formData: FormData = new FormData();
    formData.append('fullName', fullName);
    formData.append('joinPassword', joinPassword);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getListMeeting() {
    const url = `meeting-rooms/`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  postCreateNewMeeting(meetingInfo: any) {
    const url = `meeting-rooms/`;
    const formData = new FormData();
    formData.append('name', meetingInfo.meetingName);
    formData.append('moderator_password', meetingInfo.pinModerator);
    formData.append('attendee_password', meetingInfo.pinAttendees);
    formData.append('mute_participants_on_join', meetingInfo.muteParticipants);
    formData.append('require_mod_approval', meetingInfo.moderatorApproval);
    formData.append('allow_any_user_start', meetingInfo.allowUserStart);
    formData.append('all_users_join_as_mod', meetingInfo.usersJoinAsModerator);
    formData.append('allow_recording', meetingInfo.allowRecording);
    formData.append('max_number_of_participants', meetingInfo.maxParticipants);
    formData.append('welcome_message', meetingInfo.welcomeMessage);
    formData.append('private_setting_id', meetingInfo.privateSetting);
    formData.append('require_meeting_password', meetingInfo.requirePasswordToJoin);
    formData.append('live_stream_active', meetingInfo.allowStreaming);
    formData.append('live_stream_feedback_active', meetingInfo.allowStreamingFeedback);
    if (!!meetingInfo.files) {
      for (let file of meetingInfo.files) {
        formData.append('files', file);
      }
    }
    return this.http.post(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  postEditMeeting(meetingId: number, meetingInfo: any) {
    const url = `meeting-rooms/${meetingId}/`;
    const formData = new FormData();
    formData.append('name', meetingInfo.meetingName);
    formData.append('moderator_password', meetingInfo.pinModerator);
    formData.append('attendee_password', meetingInfo.pinAttendees);
    formData.append('mute_participants_on_join', meetingInfo.muteParticipants);
    formData.append('require_mod_approval', meetingInfo.moderatorApproval);
    formData.append('allow_any_user_start', meetingInfo.allowUserStart);
    formData.append('all_users_join_as_mod', meetingInfo.usersJoinAsModerator);
    formData.append('allow_recording', meetingInfo.allowRecording);
    formData.append('max_number_of_participants', meetingInfo.maxParticipants);
    formData.append('welcome_message', meetingInfo.welcomeMessage);
    formData.append('private_setting_id', meetingInfo.privateSetting);
    formData.append('require_meeting_password', meetingInfo.requirePasswordToJoin);
    formData.append('live_stream_active', meetingInfo.allowStreaming);
    formData.append('live_stream_feedback_active', meetingInfo.allowStreamingFeedback);
    if (!!meetingInfo.files) {
      for (let file of meetingInfo.files) {
        formData.append('files', file);
      }
    }
    return this.http.put(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  startMeeting(meetingId: number, meetingPassword: string) {
    const url = `meeting-rooms/${meetingId}/start/`;
    const formData = new FormData();
    formData.append('meeting_password', meetingPassword);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  removeMeeting(meetingId: number) {
    const url = `meeting-rooms/${meetingId}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  stopMeeting(meetingId: number) {
    const url = `meeting-rooms/${meetingId}/stop/`;
    return this.http.post(url, []).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }
  getMeetingById(meetingId: number) {
    const url = `meeting-rooms/${meetingId}/`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getListRecording(meetingId: number) {
    const url = `meeting-rooms/${meetingId}/recordings/`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  deleteRecording(meetingId: number, recordId: string) {
    const url = `meeting-rooms/${meetingId}/recordings/${recordId}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  publishRecording(meetingId: number, recordId: string, isPublish: string) {
    const url = `meeting-rooms/${meetingId}/recordings/${recordId}/`;
    const formData = new FormData();
    let publish = 'true';
    if (isPublish == 'no') {
      publish = 'false';
    }
    formData.append('publish', publish);

    return this.http.put(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  postCreateMeetingRoomPublicLink(meetingId: number) {
    const url = `meeting-rooms/${meetingId}/share/public/`;
    return this.http.post(url, null).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  deleteRemoveMeetingRoomPublicLink(meetingId: number) {
    const url = `meeting-rooms/${meetingId}/share/public/`;
    return this.http.delete(url, null).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getSearchUser(q: string) {
    const url = `search-user/?q=${q}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postSubmitShareToUser(emailStr: string, role: string, meetingId: number) {
    const url = `meeting-rooms/${meetingId}/share/users/`;
    const formData = new FormData();
    formData.append('share_to', emailStr);
    formData.append('role', role);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getSharedToUserList(meetingId) {
    const url = `meeting-rooms/${meetingId}/share/users/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteSharedToUserEntry(meetingId: number, shareEntryId: number) {
    const url = `meeting-rooms/${meetingId}/share/users/${shareEntryId}/`;
    return this.http.delete(url, null).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  testPrivateBBBConnection(bbb_url: string, bbb_secret: string) {
    const url = `meeting-rooms/test-private-bbb/`;
    const formData = new FormData();
    formData.append('bbb_url', bbb_url);
    formData.append('bbb_secret', bbb_secret);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getSearchGroupForSharing(query: string = '') {
    const url = `meeting-rooms/share/groups/search/`;
    const options = {
      search: {
        q: encodeURIComponent(query)
      }
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postSubmitShareToGroup(groupStr: string, meetingId: number) {
    const url = `meeting-rooms/${meetingId}/share/groups/`;
    const formData = new FormData();
    formData.append('share_to', groupStr);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getSharedToGroupList(meetingId) {
    const url = `meeting-rooms/${meetingId}/share/groups/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteSharedToGroupEntry(meetingId: number, shareEntryId: number) {
    const url = `meeting-rooms/${meetingId}/share/groups/${shareEntryId}/`;
    return this.http.delete(url, null).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getListPrivateSetting() {
    const url = `meeting-rooms/private-bbb-settings/`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getMeetingLiveStreamInfo(meetingKey: string) {
    const url = `livestream/info/${meetingKey}`;
    return this.http.get(url).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  postStreamMeetingFeedback(meetingKey: string, feedbackInfo: any) {
    const url = `livestream/feedback/${meetingKey}/`;
    const formData = new FormData();
    formData.append('username', feedbackInfo.username);
    formData.append('email', feedbackInfo.email);
    formData.append('message', feedbackInfo.message);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

}
