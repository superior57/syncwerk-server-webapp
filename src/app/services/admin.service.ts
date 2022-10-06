
import { map } from 'rxjs/operators';
import { Injectable } from '@angular/core';


import { Http, Response } from '@angular/http';

import { AppConfig, AdminAPI } from '../app.config';

import { environment } from '../../environments/environment';

@Injectable()
export class AdminService {

  constructor(
    private http: Http,
    private appConfig: AppConfig,
    private api: AdminAPI
  ) { }

  getSysAdminSettingConfig() {
    return this.http.get(`${this.api.API_SYS_SETTING}`).pipe(
      map((response: Response) => {
        const res = response.json();
        return res;
      }));
  }

  settingSystemAdmin(key: string, value: any) {
    const url = `${this.api.API_SYS_SETTING}`;
    const formData: FormData = new FormData();
    formData.append('key', key);
    formData.append('value', value);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      const res = response.json();
      return res;
    }));
  }

  getSysAdminInfo() {
    const url = `${this.api.API_ADMIN}sysinfo/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  /**
   * @param platform ['desktop', 'mobile']
   */
  getSysAdminDevices(platform: string = '', page: number = 1, perPage: number = 50) {
    const url = platform === ''
      ? `${this.api.API_ADMIN}devices/?page=${page}&per_page=${perPage}`
      : `${this.api.API_ADMIN}devices/?platform=${platform}&page=${page}&per_page=${perPage}`;
    return this.http.get(url).pipe(map((response: Response) => response.json()));
  }

  deleteSysAdminDevices(platform: string, deviceID: string, user: string, wipeDevice: boolean = false) {
    const url = `${this.api.API_ADMIN}devices/?platform=${platform}&device_id=${deviceID}&user=${user}&wipe_device=${wipeDevice}`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getListSysAdminFoldersAll(page: string = '1', perPage: string = '100') {
    const url = `${this.api.API_ADMIN}folders/?page=${page}&per_page=${perPage}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteAdminFolder(repoID: string) {
    const url = `${this.api.API_ADMIN}folders/${repoID}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  tranferSysAdminFoldersAll(repoID: string, owner: string) {
    const url = `${this.api.API_ADMIN}folders/${repoID}/`;
    const formData: FormData = new FormData();
    formData.append('owner', owner);
    return this.http.put(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getListUserGroupShares(repoID: string, shareType: string) {
    const url = `${this.api.API_ADMIN}shares/?repo_id=${repoID}&share_type=${shareType}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getListUserShareToGroup(repoID: string, share_type: string) {
    const url = `${this.api.API_ADMIN}folders/${repoID}/shares/?share_type=${share_type}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postShareToUserGroup(repoID: string, shareType: string, shareTo: string, permission: string) {
    const url = `${this.api.API_ADMIN}shares/`;
    const formData: FormData = new FormData();
    formData.append('repo_id', repoID);
    formData.append('share_type', shareType);
    formData.append('share_to', shareTo);
    formData.append('permission', permission);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  putUpdateShareToUserGroupPermission(repoID: string, shareType: string, shareTo: string, permission: string) {
    const url = `${this.api.API_ADMIN}shares/`;
    const formData: FormData = new FormData();
    formData.append('repo_id', repoID);
    formData.append('share_type', shareType);
    formData.append('share_to', shareTo);
    formData.append('permission', permission);
    return this.http.put(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteShareUserGroupPermission(repoID: string, shareType: string, shareTo: string) {
    const url = `${this.api.API_ADMIN}shares/?repo_id=${repoID}&share_type=${shareType}&share_to=${shareTo}`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  createFolderInFoldersAll(body) {
    const url = `${this.api.API_ADMIN}folders/`;
    // const formData: FormData = new FormData();
    // formData.append('name', name);
    // formData.append('owner', owner);
    // formData.append('passwd', password);
    return this.http.post(url, body).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getSystemFolders() {
    const url = `${this.api.API_ADMIN}system-folders/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getFileFolderOfFolder(repoID: string, parentDir: string = '') {
    const url = `${this.api.API_ADMIN}folders/${repoID}/dirents/`;
    const options = {
      search: {
        parent_dir: parentDir
      },
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postCreateFolderInSysFolders(repoID: string, parentDir: string = '', objName: string) {
    const url = `${this.api.API_ADMIN}folders/${repoID}/dirents/`;
    const formData: FormData = new FormData();
    formData.append('obj_name', objName);
    const options = {
      search: {
        parent_dir: parentDir
      },
    };
    return this.http.post(url, formData, options).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteFileFolderInFoldersSys(repoID: string, path: string) {
    const url = `${this.api.API_ADMIN}folders/${repoID}/dirent/`;
    const options = {
      search: {
        path: path,
      },
    };
    return this.http.delete(url, options).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getListDatabaseUser(filter: string = '',source: string = 'DB', page: number = 1, per_page: number = 25) {
    const url = `${this.api.API_ADMIN}users/?source=${source}&page=${page}&per_page=${per_page}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getListUserSource(){
    const url = `${this.api.API_ADMIN}users/source`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postChangeUserRole(email: string, role: string) {
    const url = `${this.api.API_ADMIN}users/${email}/toggle-roles/`;
    const formData: FormData = new FormData();
    formData.append('r', role);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postChangeUserStatus(email: string, status: string) {
    const url = `${this.api.API_ADMIN}users/${email}/toggle-status/`;
    const formData: FormData = new FormData();
    formData.append('s', status);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  putUpdateUserQuota(email: string, storage: string) {
    const url = `${this.api.API_ADMIN_ACCOUNTS}${email}/`;
    const formData: FormData = new FormData();
    formData.append('storage', storage);
    return this.http.put(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteUser(email: string) {
    const url = `${this.api.API_ADMIN}users/${email}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postResetPassword(email: string) {
    const url = `${this.api.API_ADMIN}users/${email}/`;
    return this.http.post(url, {}).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getDownloadFileInSysFolders(repoID: string, path: string) {
    const url = `${this.api.API_ADMIN}folders/${repoID}/dirent/`;
    const options = {
      search: {
        path: path,
        dl: 1
      },
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getUploadLinkInSysFolders(path: string, from: string = 'web') {
    const url = `${this.api.API_ADMIN}system-folders/upload-links/`;
    const options = {
      search: {
        path: path,
        from: from
      },
    };
    return this.http.get(url, options).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getTrashFolders(page: string = '1', perPage: string = '100') {
    const url = `${this.api.API_ADMIN}trash_folders/?page=${page}&per_page=${perPage} `;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteItemTrashFolders(repoID: string) {
    const url = `${this.api.API_ADMIN}trash_folders/${repoID}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  putRestoreItemTrashFolders(repoID: string) {
    const url = `${this.api.API_ADMIN}trash_folders/${repoID}/`;
    return this.http.put(url, '').pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteCleanTrashFolders() {
    const url = `${this.api.API_ADMIN}trash_folders/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getSearchTrashFoldersByOwner(emailOwner: string) {
    const url = `${this.api.API_ADMIN}trash_folders/?owner=${emailOwner}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postAddUser(userInfo: any) {
    const url = `${this.api.API_ADMIN}users/`;
    const formData: FormData = new FormData();
    formData.append('email', userInfo.email);
    formData.append('name', userInfo.name);
    formData.append('department', userInfo.department);
    formData.append('role', userInfo.role);
    formData.append('password1', userInfo.password1);
    formData.append('password2', userInfo.password2);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postImportUser(csvFile) {
    const url = `${this.api.API_ADMIN}users/import/`;
    const formData: FormData = new FormData();
    formData.append('file', csvFile);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getExportDatabaseUserListToExcel() {
    const url = `${this.api.API_ADMIN}users/export/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response;
    }));
  }

  getSearchAllFoldersByNameOrOwner(name: string, owner: string) {
    const url = `${this.api.API_ADMIN}folders/?name=${name}&owner=${owner}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postBatchUserProcessing(userList: string[], operation: string, quota_total: string = null) {
    const url = `${this.api.API_ADMIN}users/batch/`;
    const formData: FormData = new FormData();
    for (const email of userList) {
      formData.append('emails', email);
    }
    formData.append('operation', operation);
    if (quota_total) {
      formData.append('quota_total', quota_total);
    }
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getSearchUser(query: string) {
    const url = `${this.api.API_ADMIN}users/search/?q=${query}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getSearchUserForAddAsAdmin(q: string) {
    const url = `search-user/?q=${q}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getListAdmin() {
    const url = `${this.api.API_ADMIN}users/admins/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postRevokeAdmin(email: string) {
    const url = `${this.api.API_ADMIN}users/admins/${email}/`;
    return this.http.post(url, {}).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postAddAdmins(emails: string[]) {
    const url = `${this.api.API_ADMIN}users/admins/`;
    const formData = new FormData();
    formData.append('set_admin_emails', emails.join(','));
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getSysAdminUsersInfo(userEmail: string) {
    const url = `${this.api.API_ADMIN}users/${userEmail}/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  putCreateUpdateAccount(email: string, formData: any) {
    const url = `${this.api.API_ADMIN_ACCOUNTS}${email}/`;
    return this.http.put(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postTransferOwnedLibs(email: string, repoID: string) {
    const url = `${this.api.API_ADMIN}user-info/lib/transfer/`;
    const formData: FormData = new FormData();
    formData.append('email', email);
    formData.append('repo_id', repoID);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  /**
   * typeShareLink: string = donwload-link / upload-link
  */
  deleteSharedLinksRemoveLink(token: string, typeShareLink: string) {
    const url = `${this.api.API_ADMIN}user-info/${typeShareLink}/${token}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteUserInfoGroup(groupID: string) {
    const url = `${this.api.API_ADMIN}user-info/groups/${groupID}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postChangeLogo(logoImage) {
    const url = `${this.api.API_ADMIN}logo/`;
    const formData = new FormData();
    formData.append('logo', logoImage);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postResetLogo() {
    const url = `${this.api.API_ADMIN}logo/reset/`;
    return this.http.post(url, {}).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postChangeFavicon(faviconImage) {
    const url = `${this.api.API_ADMIN}favicon/`;
    const formData = new FormData();
    formData.append('favicon', faviconImage);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postResetFavicon() {
    const url = `${this.api.API_ADMIN}favicon/reset/`;
    return this.http.post(url, {}).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getAvailableRoles() {
    const url = `roles/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postLicense(license, license_text="") {
    const url = `${this.api.API_ADMIN}license/`;
    const formData = new FormData();
    formData.append('license', license);
    formData.append('license_text', license_text);
    return this.http.post(url, formData).pipe(map((response: Response) => response.json()));
  }

  getSettingsByKeys(keys: string) {
    const url = `settings/by-keys?keys=${keys}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getRestapiSettingsByKeys(keys: string) {
    const url = `settings/restapi/by-keys?keys=${keys}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  putTransferGroup(groupId, newOwner) {
    const url = `${this.api.API_ADMIN}groups/${groupId}/`;
    const formData = new FormData();
    formData.append('new_owner', newOwner);
    return this.http.put(url, formData).pipe(map((resp: Response) => {
      return resp.json();
    }));
  }

  putRenameGroup(groupId, newName) {
    const url = `${this.api.API_ADMIN}groups/${groupId}/`;
    const formData = new FormData();
    formData.append('name', newName);
    return this.http.put(url, formData).pipe(map((resp: Response) => {
      return resp.json();
    }));
  }

  deleteGroup(groupId) {
    const url = `${this.api.API_ADMIN}groups/${groupId}/`;
    return this.http.delete(url).pipe(map((resp: Response) => {
      return resp.json();
    }));
  }

  updateGroupBBBSetting(groupID: number,  data: any) {
    const url = `${this.api.API_ADMIN}groups/${groupID}/bbb/`;
    const formData = new FormData();
    formData.append('bbb_server_url', data.bbb_server_url);
    formData.append('bbb_server_secret', data.bbb_server_secret);
    formData.append('bbb_is_active', data.bbb_is_active);

    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getGroupBBBSetting(groupID: number) {
    const url = `${this.api.API_ADMIN}groups/${groupID}/bbb/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postCreateGroup(groupName, owner) {
    const url = `${this.api.API_ADMIN}groups/`;
    const formData = new FormData();
    formData.append('group_name', groupName);
    formData.append('group_owner', owner);
    return this.http.post(url, formData).pipe(map((resp: Response) => {
      return resp.json();
    }));
  }

  getExportAllGroups() {
    const url = `${this.api.API_ADMIN}groups/export/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response;
    }));
  }

  getGroupList(name = '') {
    const url = `${this.api.API_ADMIN}groups/?name=${name}`;
    return this.http.get(url).pipe(map((resp: Response) => {
      return resp.json();
    }));
  }

  getGroupFolderList(groupId) {
    const url = `${this.api.API_ADMIN}groups/${groupId}/folders/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteUnshareGroupFolder(groupId, folderId) {
    const url = `${this.api.API_ADMIN}groups/${groupId}/folders/${folderId}`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getGroupMemebers(groupId) {
    const url = `${this.api.API_ADMIN}groups/${groupId}/members/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  putChangeMemberRole(groupId, memberEmail, isAdmin) {
    const url = `${this.api.API_ADMIN}groups/${groupId}/members/${memberEmail}/`;
    const formData = new FormData();
    formData.append('is_admin', isAdmin);
    return this.http.put(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteRemoveGroupMember(groupId, memberEmail) {
    const url = `${this.api.API_ADMIN}groups/${groupId}/members/${memberEmail}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postAddGroupMembers(groupId, emails) {
    const url = `${this.api.API_ADMIN}groups/${groupId}/members/`;
    const formData = new FormData();
    for (const email of emails) {
      formData.append('email', email);
    }
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getListSystemNotification() {
    const url = `${this.api.API_ADMIN}sysnotifications/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postAddNewSystemNotification(message: string, isPrimary = false) {
    const url = `${this.api.API_ADMIN}sysnotifications/`;
    const formData = new FormData();
    formData.append('message', message);
    formData.append('primary', isPrimary.toString());
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  putUpdateSystemNotification(notificationId, isPrimary, message) {
    const url = `${this.api.API_ADMIN}sysnotifications/${notificationId}/`;
    const formData = new FormData();
    formData.append('primary', isPrimary);
    formData.append('message', message);
    return this.http.put(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteSystemNotification(notificationId) {
    const url = `${this.api.API_ADMIN}sysnotifications/${notificationId}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getListTenant() {
    const url = `${this.api.API_ADMIN}tenants/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postAddNewTenant(tenantName) {
    const url = `${this.api.API_ADMIN}tenants/`;
    const formData = new FormData();
    formData.append('name', tenantName);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteTenant(tenantId) {
    const url = `${this.api.API_ADMIN}tenants/${tenantId}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getTenantDetails(tenantId) {
    const url = `${this.api.API_ADMIN}tenants/${tenantId}/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  updateTenantBBBSetting(tenantId: number,  data: any) {
    const url = `${this.api.API_ADMIN}tenants/${tenantId}/bbb/`;
    const formData = new FormData();
    formData.append('bbb_server_url', data.bbb_server_url);
    formData.append('bbb_server_secret', data.bbb_server_secret);
    formData.append('bbb_is_active', data.bbb_is_active);

    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getTenantBBBSetting(tenantId: number) {
    const url = `${this.api.API_ADMIN}tenants/${tenantId}/bbb/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postAddTenantMembers(tenantId, emailsStr) {
    const url = `${this.api.API_ADMIN}tenants/${tenantId}/users/`;
    const formData = new FormData();
    formData.append('emails', emailsStr);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postToggleTenantAdminStatus(tenantId, userEmail) {
    const url = `${this.api.API_ADMIN}tenants/${tenantId}/admins/${userEmail}/`;
    return this.http.post(url, {}).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  putUpdateTenantQuota(tenantId, quota) {
    const url = `${this.api.API_ADMIN}tenants/${tenantId}/`;
    const formData = new FormData();
    formData.append('space_quota', quota);
    return this.http.put(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteTenantUser(tenantId, userEmail) {
    const url = `${this.api.API_ADMIN}tenants/${tenantId}/users/${userEmail}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getAllPublicShareLinks() {
    const url = `${this.api.API_ADMIN}public-shares/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getAllDataTraffic(month) {
    const url = `${this.api.API_ADMIN}statistics/traffic?month=${month}`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getAllShare() {
    const url = `${this.api.API_ADMIN}all-shares/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteUploadLink(token) {
    const url = `${this.api.API_ADMIN}upload-links/${token}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteDownloadLink(token) {
    const url = `${this.api.API_ADMIN}download-links/${token}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getSudoCheck() {
    const url = `${this.api.API_ADMIN}sudo/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postUnlockSudo(password) {
    const url = `${this.api.API_ADMIN}sudo/`;
    const formData = new FormData();
    formData.append('password', password);
    return this.http.post(url, formData).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getListVirusFiles() {
    const url = `${this.api.API_ADMIN}virus_scan_records/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  onHandleVirusFile(scanRecordId) {
    const url = `${this.api.API_ADMIN}virus_scan_records/${scanRecordId}/`;
    return this.http.delete(url, {}).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  putVirusFileMarkedAsFalsePositive(scanRecordId) {
    const url = `${this.api.API_ADMIN}virus_scan_records/${scanRecordId}/`;
    return this.http.put(url, {}).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getListOfUserEmailChangeRequest(limit = 10, page = 1, searchQuery = '', orderBy = 'created_at', orderType= 'desc') {
    const url = `${this.api.API_ADMIN}email-change-requests/`;
    const requestConfig = {
      search: {
        page: page || 1,
        per_page: limit || 10,
        s: searchQuery || '',
        order_by: orderBy || 'created_at',
        order_type: orderType || 'desc',
      }
    };
    return this.http.get(url, requestConfig).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  postTriggerEmailChange(requestId) {
    const url = `${this.api.API_ADMIN}email-change-requests/${requestId}/`;
    return this.http.post(url, {}).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteRemoveEmailChangeRequest(requestId) {
    const url = `${this.api.API_ADMIN}email-change-requests/${requestId}/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  getListAuditLog(limit = 10,
                  page = 1,
                  dataSearch = {
                    name: '',
                    startDate: '',
                    endDate: '',
                    ip: '',
                    device_name: '',
                    folder: '',
                    folder_id:'',
                    subfolder: '',
                    action: '',
                    recipient: '',
                    permissions: ''}) {
    const url = `${this.api.API_ADMIN}audit-log/`;
    const requestConfig = {
      search: {
        page: page || 1,
        per_page: limit || 10,
        name: dataSearch.name,
        updated_at__gte: dataSearch.startDate,
        updated_at__lte: dataSearch.endDate,
        ip_address: dataSearch.ip,
        device_name: dataSearch.device_name,
        folder: dataSearch.folder,
        folder_id: dataSearch.folder_id,
        sub_folder_file: dataSearch.subfolder,
        action_type: dataSearch.action,
        recipient: dataSearch.recipient,
        permissions: dataSearch.permissions
      }
    };
    return this.http.get(url, requestConfig).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  deleteAllAuditLog() {
    const url = `${this.api.API_ADMIN}audit-log/`;
    return this.http.delete(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  testMeetingConnection() {
    const url = `meeting-rooms/test-bbb/`;
    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }

  exportAuditLog(dataSearch = {
    name: '',
    startDate: '',
    endDate: '',
    ip: '',
    folder: '',
    subfolder: '',
    action: '',
    recipient: '',
    permissions: ''}) {
    const url = `${this.api.API_ADMIN}audit-log/export/`;
    const requestConfig = {
      search: {
        name: dataSearch.name,
        updated_at__gte: dataSearch.startDate,
        updated_at__lte: dataSearch.endDate,
        ip_address: dataSearch.ip,
        folder: dataSearch.folder,
        sub_folder_file: dataSearch.subfolder,
        action_type: dataSearch.action,
        recipient: dataSearch.recipient,
        permissions: dataSearch.permissions
      }
    };
    return this.http.get(url, requestConfig).pipe(map((response: Response) => {
      return response;
    }));
  }

  getListDropDownAuditLog() {
    const url = `${this.api.API_ADMIN}audit-log/dropdown-info/`;

    return this.http.get(url).pipe(map((response: Response) => {
      return response.json();
    }));
  }
  getMeetingById(meetingId: number) {
      const url = `${this.api.API_ADMIN}meeting-rooms/${meetingId}/`;
      return this.http.get(url).pipe(map((response: Response) => {
          const res = response.json();
          return res;
      }));
  }

  postEditMeeting(meetingId: number, meetingInfo: any) {
      const url = `${this.api.API_ADMIN}meeting-rooms/${meetingId}/`;
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
  removeMeeting(meetingId: number) {
        const url = `${this.api.API_ADMIN}meeting-rooms/${meetingId}/`;
        return this.http.delete(url).pipe(map((response: Response) => {
            const res = response.json();
            return res;
        }));
    }

    getListMeeting() {
        const url = `${this.api.API_ADMIN}meeting-rooms/`;
        return this.http.get(url).pipe(map((response: Response) => {
            const res = response.json();
            return res;
        }));
    }
    startMeeting(meetingId: number) {
        const url = `${this.api.API_ADMIN}meeting-rooms/${meetingId}/start/`;
        return this.http.post(url, []).pipe(map((response: Response) => {
            const res = response.json();
            return res;
        }));
    }
    stopMeeting(meetingId: number) {
        const url = `${this.api.API_ADMIN}meeting-rooms/${meetingId}/stop/`;
        return this.http.post(url, []).pipe(map((response: Response) => {
            const res = response.json();
            return res;
        }));
    }

    postCreateNewMeeting(meetingInfo: any) {
        const url = `${this.api.API_ADMIN}meeting-rooms/`;
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
        formData.append('room_owner', meetingInfo.roomOwner);
        formData.append('require_meeting_password', meetingInfo.requirePasswordToJoin);
        formData.append('private_setting_id', meetingInfo.privateSetting);
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
    getListRecording(meetingId: number) {
        const url = `${this.api.API_ADMIN}meeting-rooms/${meetingId}/recordings/`;
        return this.http.get(url).pipe(map((response: Response) => {
            const res = response.json();
            return res;
        }));
    }

    deleteRecording(meetingId: number, recordId: string) {
        const url = `${this.api.API_ADMIN}meeting-rooms/${meetingId}/recordings/${recordId}/`;
        return this.http.delete(url).pipe(map((response: Response) => {
            const res = response.json();
            return res;
        }));
    }

    publishRecording(meetingId: number, recordId: string, isPublish: string) {
        const url = `${this.api.API_ADMIN}meeting-rooms/${meetingId}/recordings/${recordId}/`;
        const formData = new FormData();
        let publish = 'true';
        if (isPublish=='no') {
            publish = 'false';
        }
        formData.append('publish', publish);

        return this.http.put(url, formData).pipe(map((response: Response) => {
            const res = response.json();
            return res;
        }));
    }

    postCreateMeetingRoomPublicLink(meetingId: number) {
      const url = `${this.api.API_ADMIN}meeting-rooms/${meetingId}/share/public/`;
      return this.http.post(url, null).pipe(map((response: Response) => {
        const res = response.json();
        return res;
      }));
    }

    deleteRemoveMeetingRoomPublicLink(meetingId: number) {
      const url = `${this.api.API_ADMIN}meeting-rooms/${meetingId}/share/public/`;
      return this.http.delete(url, null).pipe(map((response: Response) => {
        const res = response.json();
        return res;
      }));
    }

    postSubmitShareToUser(emailStr: string, role: string, meetingId: number) {
      const url = `${this.api.API_ADMIN}meeting-rooms/${meetingId}/share/users/`;
      const formData = new FormData();
      formData.append('share_to', emailStr);
      formData.append('role', role);
      return this.http.post(url, formData).pipe(map((response: Response) => {
        const res = response.json();
        return res;
      }));
    }

    getSharedToUserList(meetingId) {
      const url = `${this.api.API_ADMIN}meeting-rooms/${meetingId}/share/users/`;
      return this.http.get(url).pipe(map((response: Response) => {
        return response.json();
      }));
    }

    deleteSharedToUserEntry(meetingId: number, shareEntryId: number) {
      const url = `${this.api.API_ADMIN}meeting-rooms/${meetingId}/share/users/${shareEntryId}/`;
      return this.http.delete(url, null).pipe(map((response: Response) => {
        const res = response.json();
        return res;
      }));
    }

    getSearchGroupForSharing(query: string = '') {
      const url = `${this.api.API_ADMIN}meeting-rooms/share/groups/search/`;
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
      const url = `${this.api.API_ADMIN}meeting-rooms/${meetingId}/share/groups/`;
      const formData = new FormData();
      formData.append('share_to', groupStr);
      return this.http.post(url, formData).pipe(map((response: Response) => {
        const res = response.json();
        return res;
      }));
    }

    getSharedToGroupList(meetingId) {
      const url = `${this.api.API_ADMIN}meeting-rooms/${meetingId}/share/groups/`;
      return this.http.get(url).pipe(map((response: Response) => {
        return response.json();
      }));
    }

    deleteSharedToGroupEntry(meetingId: number, shareEntryId: number) {
      const url = `${this.api.API_ADMIN}meeting-rooms/${meetingId}/share/groups/${shareEntryId}/`;
      return this.http.delete(url, null).pipe(map((response: Response) => {
        const res = response.json();
        return res;
      }));
    }

    getListBBBServer() {
      const url = `${this.api.API_ADMIN}bbb-settings/`;
      return this.http.get(url).pipe(map((response: Response) => {
        const res = response.json();
        return res;
      }));
    }

    postAddBBBServer(bbbServerInfo) {
      const url = `${this.api.API_ADMIN}bbb-settings/`;
      const formData = new FormData();
      formData.append('bbb_config_name', bbbServerInfo.bbbServerName)
      formData.append('bbb_server', bbbServerInfo.bbbServer)
      formData.append('bbb_secret', bbbServerInfo.bbbServerSecret)
      formData.append('server_owner', bbbServerInfo.serverOwner)
      formData.append('live_stream_token', bbbServerInfo.liveStreamToken)
      formData.append('live_stream_server', bbbServerInfo.liveStreamServer)
      return this.http.post(url, formData).pipe(map((response: Response) => {
        const res = response.json();
        return res;
      }));
    }

    getBBBServerById(id) {
      const url = `${this.api.API_ADMIN}bbb-settings/${id}/`;
      return this.http.get(url).pipe(map((response: Response) => {
        const res = response.json();
        return res;
      }));
    }

    putEditBBBServer(id, bbbServerInfo) {
      const url = `${this.api.API_ADMIN}bbb-settings/${id}/`;
      const formData = new FormData();
      formData.append('bbb_config_name', bbbServerInfo.bbbServerName)
      formData.append('bbb_server', bbbServerInfo.bbbServer)
      formData.append('bbb_secret', bbbServerInfo.bbbServerSecret)
      formData.append('live_stream_token', bbbServerInfo.liveStreamToken)
      formData.append('live_stream_server', bbbServerInfo.liveStreamServer)
      return this.http.put(url, formData).pipe(map((response: Response) => {
        const res = response.json();
        return res;
      }));
    }

    deleteBBBServer(id) {
      const url = `${this.api.API_ADMIN}bbb-settings/${id}/`;
      return this.http.delete(url).pipe(map((response: Response) => {
        const res = response.json();
        return res;
      }));
    }

    getInitAddEditMeetingModal() {
      const url = `${this.api.API_ADMIN}meeting-rooms/add-modal-init/`;
      return this.http.get(url).pipe(map((response: Response) => {
        const res = response.json();
        return res;
      }));
    }
}
