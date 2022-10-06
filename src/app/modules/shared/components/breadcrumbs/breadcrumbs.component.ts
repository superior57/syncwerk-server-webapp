import { Component, OnInit, OnChanges, SimpleChanges, Input, Output, EventEmitter } from '@angular/core';
import { Object } from 'core-js/library/web/timers';
import { splitAtColon } from '@angular/compiler/src/util';
import { rootRenderNodes } from '@angular/core/src/view/util';

@Component({
  selector: 'app-breadcrumbs',
  templateUrl: './breadcrumbs.component.html',
  styleUrls: ['./breadcrumbs.component.scss']
})

/**
 * The input of this breadcrumbs can be a string or an array of path.
 * This path needs to include a repo name.
 * If the path is string then it must be /a/b/c/.
*/
export class BreadcrumbsComponent implements OnInit, OnChanges {
  @Input() titleBreadcrumbs: string = null;
  @Input() breadcrumbs = { paths: <any>null };
  @Output() sendDataBreadcrumbs = new EventEmitter<any>();
  rootBreadcrumbs: string;
  originalBreadcrumbs;

  constructor() { }

  ngOnChanges(changes: SimpleChanges) {
    if (typeof this.breadcrumbs.paths === 'string') { this.handlePathString(); }
  }

  ngOnInit() { }

  handlePathString() {
    if (this.breadcrumbs.paths === '/') {
      this.breadcrumbs.paths = [];
    } else {
      const decodePaths = decodeURIComponent(this.breadcrumbs.paths);
      const pathSplit = decodePaths.split('/');
      pathSplit.shift();
      pathSplit.pop();
      this.originalBreadcrumbs = pathSplit;
      this.rootBreadcrumbs = pathSplit.filter((_, index) => index === 0)[0];
      this.breadcrumbs.paths = pathSplit.filter((_, index) => index !== 0);
    }
  }

  navigateBreadcrumbs(index: number) {
    const pathJoin = `/${this.breadcrumbs.paths.slice(0, index + 1).join('/')}`;
    const dataBreadcrumbs = {
      'position': index + 1,
      'original': this.originalBreadcrumbs,
      'p': index === -1 ? '/' : pathJoin,
    };
    this.sendDataBreadcrumbs.emit(dataBreadcrumbs);
  }
}
