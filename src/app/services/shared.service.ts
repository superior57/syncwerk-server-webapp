import { Injectable } from '@angular/core';
import { Subject } from 'rxjs';

@Injectable()
export class SharedService {

  // Sidebar visibility
  sidebarVisible: boolean;
  sidebarVisibilitySubject: Subject<boolean> = new Subject<boolean>();

  // Theming
  maTheme: string;
  maThemeSubject: Subject<string> = new Subject<string>();

  toggleSidebarVisibilty() {
    this.sidebarVisible = !this.sidebarVisible;
    this.sidebarVisibilitySubject.next(this.sidebarVisible);
  }

  setTheme(color) {
    this.maTheme = color;
    this.maThemeSubject.next(this.maTheme);
  }

  constructor() {
    // Hidden the sidebar by default
    this.sidebarVisible = false;

    // Set default theme as blue-grey
    this.maTheme = 'blue-grey';
  }
}
