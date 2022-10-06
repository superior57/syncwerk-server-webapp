import { map } from 'rxjs/operators';

import { Component, OnInit, Input } from '@angular/core';

import { Subscription, Observable } from 'rxjs';

import { GroupsService, MeetingsService, NotificationService, AdminService } from '@services/index';


@Component({
  selector: 'app-share-meeting-modal-group',
  templateUrl: './share-meeting-modal-group.component.html',
  styleUrls: ['./share-meeting-modal-group.component.scss']
})
export class ShareMeetingModalGroupComponent implements OnInit {

  @Input() meetingRoomId = -1;
  @Input() isAdministration = false;

  tagInputItemAdded

  groupListForShare = [];
  groupSharedFromAPI = [];

  constructor(
    private groupService: GroupsService,
    private meetingsService: MeetingsService,
    private notify: NotificationService,
    private adminService: AdminService,
  ) { }

  ngOnInit() {
    console.log(this.isAdministration);
    this.getListSharedToGroups();
  }

  getListSharedToGroups() {
    if (this.isAdministration) {
      this.adminService.getSharedToGroupList(this.meetingRoomId).subscribe(resp => {
        this.groupSharedFromAPI = resp.data.data;
        console.log(this.groupSharedFromAPI);
      }, err => {
        const errorBody = JSON.parse(err._body);
      })
    } else {
      this.meetingsService.getSharedToGroupList(this.meetingRoomId).subscribe(resp => {
        this.groupSharedFromAPI = resp.data.data;
        console.log(this.groupSharedFromAPI);
      }, err => {
        const errorBody = JSON.parse(err._body);
      })
    }

  }

  public autocompleteGroupList = (text: string): Observable<any> => {
    if (this.isAdministration) {
      return this.adminService.getSearchGroupForSharing(text).pipe(map(result => {
        console.log(result)
        return result.data.groups.map(group => {
          return {
            display: group.name,
            value: group.name,
            group,
          };
        });
      }));
    } else {
      return this.meetingsService.getSearchGroupForSharing(text).pipe(map(result => {
        return result.data.map(group => {
          return {
            display: group.name,
            value: group.name,
            group,
          };
        });
      }));
    }

  }

  public autocompleteGroupMatching = (value, target): boolean => {
    return true;
  }

  onEnter() {
    if (this.tagInputItemAdded) {
      this.tagInputItemAdded = false;
      return;
    }
    this.submitShareToGroup();
  }

  onItemAdded(event) {
    this.tagInputItemAdded = true;
  }

  submitShareToGroup() {
    if (this.isAdministration) {
      const shareToGroupStr = this.groupListForShare.map((groupObj) => groupObj.value).join(',');
      this.adminService.postSubmitShareToGroup(shareToGroupStr, this.meetingRoomId).subscribe(resp => {
        this.getListSharedToGroups();
        this.groupListForShare = [];
        this.notify.showNotificationByMessageKey('success', resp.message);
      }, err => {
        const errorBody = JSON.parse(err._body);
        this.notify.showNotification('danger', errorBody.message);
      })
    } else {
      const shareToGroupStr = this.groupListForShare.map((groupObj) => groupObj.value).join(',');
      this.meetingsService.postSubmitShareToGroup(shareToGroupStr, this.meetingRoomId).subscribe(resp => {
        this.getListSharedToGroups();
        this.groupListForShare = [];
        this.notify.showNotificationByMessageKey('success', resp.message);
      }, err => {
        const errorBody = JSON.parse(err._body);
        this.notify.showNotification('danger', errorBody.message);
      })
    }

  }

  removeShareToGroupEntry(shareEntry) {
    if (this.isAdministration) {
      this.adminService.deleteSharedToGroupEntry(shareEntry.meeting_room_id, shareEntry.id).subscribe(resp => {
        this.getListSharedToGroups();
        this.notify.showNotificationByMessageKey('success', resp.message);
      }, err => {
        const errorBody = JSON.parse(err._body);
        this.notify.showNotification('danger', errorBody.message);
      })
    } else {
      this.meetingsService.deleteSharedToGroupEntry(shareEntry.meeting_room_id, shareEntry.id).subscribe(resp => {
        this.getListSharedToGroups();
        this.notify.showNotificationByMessageKey('success', resp.message);
      }, err => {
        const errorBody = JSON.parse(err._body);
        this.notify.showNotification('danger', errorBody.message);
      })
    }

  }

}
