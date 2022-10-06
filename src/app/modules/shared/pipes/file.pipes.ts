import { Pipe, PipeTransform } from '@angular/core';
import { environment } from 'environments/environment';

@Pipe({ name: 'fileIconPath' })
export class FileIconPathPipe implements PipeTransform {
  transform(fileName: any, defaultImg: boolean = false, repoId: string = null, p: string = null, size: number = 48, obj_id: string = null, args?: any): any {
    const fileNameArr = fileName.split('.');
    const fileType = fileNameArr[fileNameArr.length - 1].toLowerCase();
    if (fileType === 'pdf') {
      return 'fal fa-file-pdf';
    } else if (fileType === 'txt' || fileType === 'md' || fileType === 'markdown') {
      return 'fal fa-file-alt';
    } else if (fileType === 'doc' || fileType === 'docx') {
      return 'fal fa-file-word';
    } else if (fileType === 'ppt' || fileType === 'pptx') {
      return 'fal fa-file-powerpoint';
    } else if (fileType === 'mp3' || fileType === 'midi' || fileType === 'wma' || fileType === 'wav') {
      return 'fal fa-music';
    } else if (fileType === 'mov' || fileType === 'mpeg' || fileType === 'avi' || fileType === 'wmv' || fileType === 'mp4') {
      return 'fal fa-file-video';
    } else if (fileType === 'bmp') {
      return 'fal fa-image';
    } else if ((fileType === 'png' || fileType === 'jpeg' || fileType === 'jpg' || fileType === 'gif') && !defaultImg) {
      const path = `repos/${repoId}/thumbnail/?p=${p}&size=${size}` + (obj_id ? `&obj_id=${obj_id}` : '');
      return environment.api_endpoint + path;
    } else if (fileType === 'png' && defaultImg) {
      return 'fal fa-image';
    } else if ((fileType === 'jpeg' || fileType === 'jpg') && defaultImg) {
      return 'fal fa-image';
    } else if (fileType === 'xls' || fileType === 'xlsx') {
      return 'fal fa-file-excel';
    } else if (fileType === 'zip' || fileType === 'rar' || fileType === '7z' || fileType === 'gz' || fileType === 'bz2') {
      return 'fal fa-file-archive';
    } else if (fileType === 'exe') {
      return 'fal fa-cogs';
    } else if (fileType === 'html') {
      return 'fal fa-file-code';
    } else {
      return 'fal fa-file';
    }
  }
}

@Pipe({ name: 'customFileIcon' })
export class CustomFileIconPipe implements PipeTransform {
  transform(fileName: string, defaultCustom: boolean = true, linkImage: string): any {
    const splitFileName = fileName.split('.', 2)[1];
    const fileType = splitFileName !== undefined ? splitFileName.toLowerCase() : splitFileName;
    if (fileType === 'pdf') {
      return 'fal fa-file-pdf pdf-color';
    } else if (fileType === 'txt' || fileType === 'md' || fileType === 'markdown') {
      return 'fal fa-file-alt';
    } else if (fileType === 'doc' || fileType === 'docx') {
      return 'fal fa-file-word word-color';
    } else if (fileType === 'ppt' || fileType === 'pptx') {
      return 'fal fa-file-powerpoint powerpoint-color';
    } else if (fileType === 'mp3' || fileType === 'midi' || fileType === 'wma' || fileType === 'wav') {
      return 'fal fa-music';
    } else if (fileType === 'mov' || fileType === 'wmv' || fileType === 'mpeg' || fileType === 'avi' || fileType === 'mp4') {
      return 'fal fa-file-video';
    } else if (fileType === 'bmp') {
      return 'fal fa-image';
    } else if ((fileType === 'png' || fileType === 'jpeg' || fileType === 'jpg') && !defaultCustom) {
      return linkImage;
    } else if (fileType === 'jpeg' || fileType === 'jpg' || fileType === 'png') {
      return 'fal fa-image';
    } else if (fileType === 'xls' || fileType === 'xlsx') {
      return 'fal fa-file-excel excel-color';
    } else if (fileType === 'zip' || fileType === 'rar' || fileType === '7z' || fileType === 'gz' || fileType === 'bz2') {
      return 'fal fa-file-archive';
    } else if (fileType === 'exe') {
      return 'fal fa-cogs';
    } else if (fileType === 'html') {
      return 'fal fa-file-code';
    } else {
      return 'fal fa-file';
    }
  }
}

@Pipe({ name: 'customFileSize' })
export class FileSizePipe implements PipeTransform {

  private units = [
    'bytes',
    'KB',
    'MB',
    'GB',
    'TB',
    'PB'
  ];

  transform(bytes: number = 0, precision: number = 1): string {
    if (isNaN(parseFloat(String(bytes))) || !isFinite(bytes)) { return '?'; }
    let unit = 0;
    while (bytes >= 1000) {
      bytes /= 1000;
      unit++;
    }
    if (unit === 0) { precision = 0; }
    return bytes.toFixed(+ precision) + ' ' + this.units[unit];
  }
}

@Pipe({ name: 'imageDefault' })
export class ImageDefaultPipe implements PipeTransform {
  transform(urlImage: string, urlImageDefaultNew: string): string {
    if (urlImage) {
      const urlSplit = urlImage.split('/');
      const nameImage = urlSplit.filter((_, index, item) => index === item.length - 1);
      return nameImage[0] === 'default.png' ? urlImageDefaultNew : urlImage;
    }
  }
}

