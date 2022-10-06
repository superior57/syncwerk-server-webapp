import { Component, OnInit, Input, ViewChild, ElementRef } from '@angular/core';
import { GroupsService } from 'app/services';

declare var jQuery: any;

@Component({
  selector: 'app-discussions-group',
  templateUrl: './discussions-group.component.html',
  styleUrls: ['./discussions-group.component.scss']
})
export class DiscussionsGroupComponent implements OnInit {

  @Input() idGroup;
  @Input() currentLoginUser;
  @Input() groupInfo;
  @ViewChild('scrollDisccusions') private scrollDiscussions: ElementRef;

  groupDiscussions = {
    numberOfPages: 0,
    currentPage: 0,
    messages: [],
    currentDiscussionContent: '',
  };

  constructor(
    private groupsService: GroupsService,
  ) { }

  ngOnInit() {
    jQuery('.scrollbar-outer').scrollbar();
  }

  getGroupDiscussions(pageNumber: number = 1) {
    jQuery('.scrollbar-macosx').scrollbar();
    this.groupsService.getGroupDiscussions(this.idGroup, pageNumber).subscribe(resp => {
      this.populateDiscussion(resp.data);
      this.scrollDiscussionsBottom();
    });
  }

  populateDiscussion(disscusData) {
    this.groupDiscussions.currentPage = disscusData.current_page;
    this.groupDiscussions.numberOfPages = disscusData.page_num;
    if (disscusData.current_page <= 1) {
      this.groupDiscussions.messages = [];
    }
    for (const message of disscusData.msgs) {
      this.groupDiscussions.messages.unshift(message);
    }
  }

  replyDiscussion(message) {
    this.groupDiscussions.currentDiscussionContent = `@${message.user_name} `;
    jQuery('#commentBox').focus();
  }

  deleteDiscussion(message, index) {
    this.groupsService.removeGroupDiscussion(this.idGroup, message.id).subscribe(resp => {
      this.groupDiscussions.messages.splice(index, 1);
    });
  }

  addGroupDiscussion() {
    if (this.groupDiscussions.currentDiscussionContent.trim().length > 0) {
      const dicusssion = this.groupDiscussions.currentDiscussionContent.trim();
      this.groupDiscussions.currentDiscussionContent = '';
      this.groupsService.createGroupDiscussions(this.idGroup, dicusssion).subscribe(resp => {
        this.groupsService.getGroupDiscussions(this.idGroup, 1, 1).subscribe(resp2 => {
          this.groupDiscussions.messages.push(resp2.data.msgs[0]);
          this.groupDiscussions.currentDiscussionContent = '';
          this.scrollDiscussionsBottom();
        });
      });
    }
  }

  scrollDiscussionsBottom() {
    const scrollElement = this.scrollDiscussions.nativeElement;
    return new Promise((resolve, reject) => setTimeout(() => {
      scrollElement.scrollTop = scrollElement.scrollHeight;
      resolve();
    }));
  }
}
