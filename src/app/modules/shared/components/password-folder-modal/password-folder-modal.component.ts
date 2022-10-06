import { Component, EventEmitter, OnInit, Renderer, ViewChild, Input, Output, AfterViewInit } from '@angular/core';
import { Subject } from 'rxjs';
import { ActivatedRoute, Router } from '@angular/router';

import { Type, Action } from '@enum/index.enum';
import { FilesService, MessageService } from '@services/index';
import { TranslateService } from '@ngx-translate/core';

declare var jQuery: any;

@Component({
  selector: 'app-password-folder-modal',
  templateUrl: './password-folder-modal.component.html',
  styleUrls: ['./password-folder-modal.component.scss']
})
export class PasswordFolderModalComponent implements OnInit, AfterViewInit {
  @ViewChild('focusPassword') inputPassword;
  @Input() repoId: string;
  @Input() isAdminView: boolean;
  @Input() nameFolder: string;
  @Output() OpenEncryptedFolderCallBack = new EventEmitter<any>();

  model = { password: '' };
  errorMessage = { message: '' };

  constructor(
    private _renderer: Renderer,
    private messageService: MessageService,
    private filesService: FilesService,
    private router: Router,
    private translate: TranslateService,
  ) { }

  ngOnInit() {
    this.initData();
  }

  ngAfterViewInit() {
    return new Promise((resolve) => setTimeout(() => this.autoFocusPassword(), 500));
  }

  initData() {
    this.model.password = '';
    this.errorMessage.message = '';
  }

  autoFocusPassword() {
    this.inputPassword.nativeElement.focus();
  }

  validate() {
    if (this.model.password.length <= 0) {
      // this.errorMessage.message = 'Password is required.';
      this.errorMessage.message = this.translate.instant('VALIDATORS.PASSWORD_REQUIRED');
      this.autoFocusPassword();
      return false;
    }
    return true;
  }

  authPasswordFolder() {
    if (this.validate()) {
      this.filesService.authPasswordFolder(this.repoId, this.model.password, this.isAdminView).subscribe(resp => {
        jQuery('#password-folder-modal').modal('hide');
        this.OpenEncryptedFolderCallBack.emit(this.repoId);
      }, error => {
        this.errorMessage.message = JSON.parse(error._body).message;
        this.autoFocusPassword();
        console.error(error);
      });
    }
  }

  quitModal() {
    let route = this.router.url.split('/');
    if (route[2] === 'folders') {
      route = route.slice(0, 3);
    } else {
      route = route.slice(0, route[2] === 'groups' ? 4 : 2);
      // route = route.slice(0, route[2] === 'groups' ? 4 : 3);
    }
    this.router.navigate(route);
    jQuery('#password-folder-modal').modal('hide');
  }
}
