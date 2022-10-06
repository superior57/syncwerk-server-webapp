import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { Router } from '@angular/router';

import { FilesService, OtherService } from '@services/index';


@Component({
  selector: 'app-profile-email',
  templateUrl: './profile-email.component.html',
  styleUrls: ['./profile-email.component.scss']
})
export class ProfileEmailComponent implements OnInit {

  email: string;
  profileEmailData: any = {
  };
  isSuccess = null;
  statusMessage = '';
  urlAvatarUser: string;
  isDefaultAvater = false;

  constructor(
    private route: ActivatedRoute,
    private filesService: FilesService,
    private router: Router,
    private otherService: OtherService,
  ) { }

  ngOnInit() {
    this.route.params.subscribe(params => {
      this.email = params['email'];
      this.getImageUserResized();
      this.getProfileEmail(this.email);
    });
  }

  getImageUserResized() {
    // this.otherService.getResizedAvatarUser(this.email, '300').subscribe(resps => this.urlAvatarUser = resps.url);
  }

  getProfileEmail(email) {
    this.filesService.getProfileEmail(email)
      .subscribe(resp => {
        this.isDefaultAvater = resp.data.is_default_avatar;
        this.isSuccess = true;
        this.profileEmailData = resp.data;
        this.urlAvatarUser = resp.data.avatar_url;
        if (resp.data.profile) {
          this.profileEmailData.profile = this.profileEmailData.profile[0] ? this.profileEmailData.profile[0] : null;
        }
      }, error => {
        const status = error.status;
        this.isSuccess = false;
        this.statusMessage = JSON.parse(error._body).message;
      });
  }
}
