export class FoldersModel {
  id: string;
  encrypted: boolean;
  name: string;
  size: number;
  size_formatted: string;
  mtime: number;
  mtime_relative: string;
  desc: string;
  owner: string;
  constructor(id: string, encrypted: boolean, name: string, size: number, size_formated: string, mtime: number, mtime_relative: string, desc: string, owner: string='') {
    this.id = id;
    this.encrypted = encrypted;
    this.name = name;
    this.size = size;
    this.size_formatted = size_formated;
    this.mtime = mtime;
    this.mtime_relative = mtime_relative;
    this.desc = desc;
    this.owner = owner;
  }
}
