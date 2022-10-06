import { Pipe, PipeTransform } from '@angular/core';

@Pipe({ name: 'splice_length' })
export class SpliceLength implements PipeTransform {
  transform(value: string, length: number): any {
    if (value.length < length) {
      return value;
    }
    return value.substring(0, length) + '...';
  }
}

@Pipe({ name: 'CutStringAny' })
/**
 * limitLength >= headLength + endLength + 5
 * |(headLength - endLength)| >= 5
**/
export class CutStringAnyPipe implements PipeTransform {
  transform(str: string, limitLength: number = 30, headLength: number = 20, endLength: number = 5): string {
    if (str) {
      if (limitLength >= (headLength + endLength + 5) && Math.abs(headLength - endLength) >= 5) {
        if (str.length > limitLength) {
          const cutHeadStr = str.substring(0, headLength);
          const cutEndStr = str.substring(str.length - endLength, str.length);
          return cutHeadStr + ' ... ' + cutEndStr;
        } else {
          return str;
        }
      } else {
        console.error('The input value of the handleString is incorrect.');
      }
    }
  }
}


