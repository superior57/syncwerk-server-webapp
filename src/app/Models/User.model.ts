export class User {
  public username;
  public email;
  public department;
  public avatar_url;
  public space_usage;
  public space_quota;
  public onlyoffice_open_mode;
  constructor(username: String, email: String, department: String) {
    this.username = username;
    this.email = email;
    this.department = department;
  }
}
