import { Component, OnInit, Output, EventEmitter, Renderer2, ViewChild, ElementRef } from '@angular/core';
import { TranslateService } from '@ngx-translate/core';
import { FormControl, FormGroup, Validators, FormBuilder } from '@angular/forms';
import { Select2OptionData } from 'ng2-select2';

import { NotificationService, AdminService } from 'app/services';
import { BsModalRef } from 'ngx-bootstrap/modal/bs-modal-ref.service';

declare var jQuery: any;


@Component({
  selector: 'app-modal-tenant-add-new-member',
  templateUrl: './modal-tenant-add-new-member.component.html',
  styleUrls: ['./modal-tenant-add-new-member.component.scss']
})
export class ModalTenantAddNewMemberComponent implements OnInit {

  @Output() onAddUserSuccess = new EventEmitter();

  @ViewChild('password') private passwordElement: ElementRef;
  @ViewChild('confirmPassword') private confirmPasswordElement: ElementRef;
  @ViewChild('email') private emailElement: ElementRef;

  public exampleData: Array<Select2OptionData> = [];
  public disableSearchOptions: any = {
    dropdownAutoWidth: true,
    minimumResultsForSearch: 100,
    width: '50%',
    containerCssClass: 'select2-selection--alt',
    dropdownCssClass: 'select2-dropdown--alt'
  };
  addUserForm: FormGroup;
  isPasswordShown = false;
  // selectedFile = null;
  // isUploadProcessing = false;
  role = `default`;
  isAddProcessing = false;
  isReachedMaxLicensedUser = false;

  avaliableAdminRoles = [];
  avaliableUserRoles = [];
  selectedTenant: any = {};
  isAllowAdminAddRoles: any = {};

  constructor(
    private formBuilder: FormBuilder,
    private noti: NotificationService,
    private adminService: AdminService,
    private renderer: Renderer2,
    private translate: TranslateService,
    private BsModalRef: BsModalRef,
  ) { }


  ngOnInit() {
    setTimeout(() => this.emailElement.nativeElement.focus(), 600);
    this.getAvailableRoles();
    this.adminService.getSysAdminInfo().subscribe(resp => {
      this.isReachedMaxLicensedUser = (resp.data.active_users_count >= resp.data.license_json.allowed_users);
    });
    this.initAddUserForm();
  }

  getAvailableRoles() {
    this.adminService.getAvailableRoles().subscribe(resp => {
      this.exampleData = [];
      const roleOptions = [];
      this.avaliableAdminRoles = resp.data.admin_roles;
      this.avaliableUserRoles = resp.data.user_roles;
      if (this.isAllowAdminAddRoles) {
        // admin roles
        const adminRolesOptionsGroup = {
          id: 'admin_role',
          text: this.translate.instant('ROLES.ADMIN_ROLES'),
          disabled: true,
          children: []
        };
        for (const role of resp.data.admin_roles) {
          adminRolesOptionsGroup.children.push({
            id: role,
            text: role,
            isAdminRole: true,
          });
        }
        roleOptions.push(adminRolesOptionsGroup);
      }

      // user roles
      const userRolesOptionsGroup = {
        id: 'user_roles',
        text: this.translate.instant('ROLES.USER_ROLES'),
        disabled: true,
        children: [],
      };

      for (const role of resp.data.user_roles) {
        userRolesOptionsGroup.children.push({
          id: role,
          text: role,
          isAdminRole: false,
        });
      }
      roleOptions.push(userRolesOptionsGroup);
      this.exampleData = roleOptions;
    });
  }

  initAddUserForm() {
    this.addUserForm = this.formBuilder.group({
      email: ['', [Validators.required]],
      name: [''],
      department: [''],
      password: ['', [Validators.required, Validators.minLength(8)]],
      confirmPassword: ['', Validators.required]
    });
  }

  randomString() {
    let text = '';
    const possible = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789';

    for (let i = 0; i < 8; i++) {
      text += possible.charAt(Math.floor(Math.random() * possible.length));
    }
    return text;
  }

  generatePassword() {
    this.renderer.addClass(this.passwordElement.nativeElement, 'form-control--active');
    this.renderer.addClass(this.confirmPasswordElement.nativeElement, 'form-control--active');
    const randomPassword = this.randomString();
    this.addUserForm.controls['password'].setValue(randomPassword);
    this.addUserForm.controls['confirmPassword'].setValue(randomPassword);
  }

  validateAddUserForm() {
    if (this.addUserForm.controls['email'].errors) {
      this.noti.showNotification('danger', this.translate.instant('NOTIFICATION_MESSAGE.YOU_MUST_PROVIDE_A_VALID_EMAIL'));
      return false;
    }
    if (this.addUserForm.controls['password'].errors) {
      this.noti.showNotification('danger', this.translate.instant('FORMS.REQUIRED.PASSWORD_LENGTH'));
      return false;
    }
    if (this.addUserForm.controls['confirmPassword'].value !== this.addUserForm.controls['password'].value) {
      this.noti.showNotification('danger', this.translate.instant('FORMS.REQUIRED.REPEAT_PASSWORD'));
      return false;
    }

    return true;
  }

  addUser() {
    if (!this.validateAddUserForm()) {
      return false;
    }
    this.isAddProcessing = true;
    const newUserInfo = {
      email: this.addUserForm.value.email,
      name: this.addUserForm.value.name,
      department: this.addUserForm.value.department,
      role: this.role,
      password1: this.addUserForm.value.password,
      password2: this.addUserForm.value.confirmPassword,
    };

    // Create user now
    this.adminService.postAddUser(newUserInfo).subscribe(resp => {
      this.adminService.postAddTenantMembers(this.selectedTenant.id, newUserInfo.email).subscribe(respon => {
        const numberOfSuccessful = respon.data.successful.length;
        this.noti.showNotification('success', this.translate.instant('ADMIN.INSTITUTIONS.MESSAGES.ADD_INSTITUTION_MEMBER_SUCCESS', { numberOfSuccessful }));
      });
      this.BsModalRef.hide();
    }, error => {
      this.isAddProcessing = false;
      const errorBody = JSON.parse(error._body);
      this.noti.showNotification('danger', errorBody.message);
    });
  }

  changedSettingRole(data) {
    if (data.data.length > 0) {
      this.role = data.data[0].id;
    }
  }

  checkEmail(data) {
    console.log(data);
    console.log(this.addUserForm);
  }

}
