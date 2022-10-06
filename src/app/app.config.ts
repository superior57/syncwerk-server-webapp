export class AppConfig {
  GetDataWith(key) {
    const data = localStorage.getItem(key);
    if (data != null) {
      return data;
    }
    return null;
  }
  SetDataWith(key, value) {
    localStorage.setItem(key, value);
  }
  RemoveDataWith(key) {
    localStorage.removeItem(key);
  }
}

export class AuthenticationAPI {
  public readonly API_LOGIN = 'auth-token';
  public readonly API_CHECK_LOGIN = 'auth-status';
  public readonly API_LOGOUT = 'logout';
  public readonly API_USER_INFO = 'account/info/';
  public readonly API_DELETE_ACCOUNT = 'delete-account/';
  public readonly API_PROFILE = 'profile/';
  public readonly API_PROFILE_AVATAR = 'profile/avatar/';
  public readonly API_CHANGE_PASSWORD = 'profile/password/';
  public readonly API_CHANGE_DEFAULT_FOLDER = 'profile/default-repo/';
}

export class FilesAPI {
  public readonly API_REPO = 'repo/';
  public readonly API_REPOS = 'repos/';
  public readonly API_SEARCH = 'search/';
  public readonly API_LIB = 'lib/';
  public readonly API_SHARE_LINK = 'share-links/';
  public readonly API_UPLOAD_LINK = 'upload-links/';
  public readonly API_SEND_SHARE_LINK = 'send-share-link/';
  public readonly API_SEND_UPLOAD_LINK = 'send-upload-link/';
  public readonly API_STARRED_FILE = 'starredfiles/';
  public readonly API_UPLOAD_URL_IN_DIR = 'u/d/';
  public readonly API_DOWNLOAD_LINK_IN_DIR = 'd/';
  public readonly API_DOWNLOAD_LINK_IN_FILE = 'f/';
  public readonly API_USER = 'user/';
  public readonly API_BESHARED = 'beshared-repos/';
  public readonly API_COPY_MOVE_TASK = 'copy-move-task/';
  public readonly API_DELETED_REPOS = 'deleted-repos/';
  public readonly API_GROUPS = 'groups/';
  public readonly API_ZIP_PROGRESS = 'query-zip-progress/';
  public readonly API_SHARED_REPOS = 'shared-repos/';
}

export class OtherAPIs {
  public readonly API_DEVICES = 'devices/';
  public readonly API_NOTIFICATION_COUNT = 'notifications/count/';
  public readonly API_NOTIFICATION_TOP = 'notifications/top/';
  public readonly API_NOTIFICATION = 'notifications/';
  public readonly API_NOTIFICATION_SINGLE = 'notification/';
  public readonly API_AVATARS_USER = 'avatars/user/';
}

export class AdminAPI {
  public readonly API_SYS_SETTING = 'sys/settings/';
  public readonly API_ADMIN = 'admin/';
  public readonly API_ADMIN_ACCOUNTS = 'accounts/';
}

export class ShareAdminAPI {
  public readonly API_SHARED_FOLDERS = 'shared-folders/';
  public readonly API_REPOS = 'repos/';
  public readonly API_SHARED_REPOS = 'shared-repos/';
  public readonly API_SHARED_UPLOAD_LINKS = 'upload-links/';
  public readonly API_SHARED_DOWNLOAD_LINKS = 'share-links/';
  public readonly API_SHARES = 'shares/';
}


export class KanbanAPI {
  public readonly API_PROJECTS = 'projects';
  public readonly API_BOARDS = 'boards';
  public readonly API_TASKS = 'tasks';
}
