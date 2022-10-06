import { Component, OnInit, Input } from '@angular/core';
import { Router } from '@angular/router';

interface Breadcrumb {
  name: string;
  path: string | Array<string>;
}

@Component({
  selector: 'app-breadcrumbs2',
  templateUrl: './breadcrumbs2.component.html',
  styleUrls: ['./breadcrumbs2.component.scss']
})
export class Breadcrumbs2Component implements OnInit {

  @Input() breadcrumbs: Array<Breadcrumb> = [];

  constructor(
    private router: Router,
  ) { }

  ngOnInit() {
  }

  navigateBreadcrumbs(path) {
    this.router.navigate(path);
  }
}
