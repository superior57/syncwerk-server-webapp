
import {map, filter} from 'rxjs/operators';
import { BehaviorSubject ,  Subscription } from 'rxjs';
import { Injectable } from '@angular/core';



interface Message {
  type: string;
  payload: any;
}
type MessageCallback = (payload: any) => void;

@Injectable()
export class MessageService {
  private message: Message = {
    type: '',
    payload: ''
  };

  private handler = new BehaviorSubject<Message>(this.message);
  broadcast(type: any, payload: any) {
    this.handler.next({ type, payload });
  }

  subscribe(type: any, callback: MessageCallback) {
    return this.handler
      .asObservable().pipe(
      filter(message => message.type === type),
      map(message => message.payload),)
      .subscribe(callback);
  }

  send(type: any, action: any, data: any) {
    const payload = {
      action: action,
      data: data
    };
    this.broadcast(type, payload);
  }

  sendWithType(type: any, data: any) {
    const payload = {
      data: data,
    };
    this.broadcast(type, payload);
  }

  getHandler() {
    return this.handler;
  }

  constructor() { }
}
