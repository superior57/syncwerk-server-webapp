/*
 * Inspinia js helpers:
 *
 * correctHeight() - fix the height of main wrapper
 * detectBody() - detect windows size
 * smoothlyMenu() - add smooth fade in/out on navigation show/ide
 * isEmpty() - check where the object exists value or empty.
 *
 */

import * as _ from 'lodash';

declare var jQuery: any;

export function correctHeight() {

  const pageWrapper = jQuery('#page-wrapper');
  const navbarHeight = jQuery('nav.navbar-default').height();
  const wrapperHeight = pageWrapper.height();

  if (navbarHeight > wrapperHeight) {
    pageWrapper.css('min-height', navbarHeight + 'px');
  }

  if (navbarHeight <= wrapperHeight) {
    if (navbarHeight < jQuery(window).height()) {
      pageWrapper.css('min-height', jQuery(window).height() + 'px');
    } else {
      pageWrapper.css('min-height', navbarHeight + 'px');
    }
  }

  if (jQuery('body').hasClass('fixed-nav')) {
    if (navbarHeight > wrapperHeight) {
      pageWrapper.css('min-height', navbarHeight + 'px');
    } else {
      pageWrapper.css('min-height', jQuery(window).height() - 60 + 'px');
    }
  }
}

export function detectBody() {
  if (jQuery(document).width() < 769) {
    jQuery('body').addClass('body-small');
  } else {
    jQuery('body').removeClass('body-small');
  }
}

export function smoothlyMenu() {
  if (!jQuery('body').hasClass('mini-navbar') || jQuery('body').hasClass('body-small')) {
    // Hide menu in order to smoothly turn on when maximize menu
    jQuery('#side-menu').hide();
    // For smoothly turn on menu
    setTimeout(
      function () {
        jQuery('#side-menu').fadeIn(400);
      }, 200);
  } else if (jQuery('body').hasClass('fixed-sidebar')) {
    jQuery('#side-menu').hide();
    setTimeout(
      function () {
        jQuery('#side-menu').fadeIn(400);
      }, 100);
  } else {
    // Remove all inline style from jquery fadeIn function to reset menu state
    jQuery('#side-menu').removeAttr('style');
  }
}

/**
 *
 * return true if obj is empty.
 * return fasle if obj exists value.
 */
export function isEmpty(obj) {
  for (const key in obj) {
    if (obj.hasOwnProperty(key)) {
      return false;
    }
  }
  return true;
}


export function isImageDefault(url: string) {
  const urlSplit = url.split('/');
  const nameImage = urlSplit.filter((_, index, item) => index === item.length - 1);
  return nameImage[0] === 'default.png' ? true : false;
}

export function getTypeRepoFromRoute(p: string[]) {
  console.log('path array', p);
  let type = '';
  if (p.length === 1) {
    return p[0];
  } else if (p.length === 2) {
    if (p[1] !== 'folders') {
      return p[1];
    } else if (p[1] === 'folders') {
      return 'mine';
    }
  }
  if (p[1] === 'groups' && p.length >= 4) {
    type = `group--${p[2]}`;
    return type;
  } else {
    if (p[1] === 'folders') {
      type = 'mine';
    } else {
      switch (p[2]) {
        case 'folders':
          type = 'mine';
          break;
        case 'shared-files':
          type = 'shared';
          break;
        case 'groups':
          type = 'all_groups';
          break;
        case 'shared-groups':
          type = 'group';
          break;
        default:
          type = p[2];
          break;
      }
    }
  }
  return type;
}

export function sortByString(direntList: any[], columnSort: string, isSortAtoZ: boolean) {
  const listSort = direntList.sort((a, b) => {
    const elementA = a[columnSort].toLowerCase();
    const elementB = b[columnSort].toLowerCase();
    if (elementA < elementB) { return isSortAtoZ ? -1 : 1; }
    if (elementA > elementB) { return isSortAtoZ ? 1 : -1; }
    return 0;
  });
  return listSort;
}

// DATA TABLE
interface Column {
  title: string;
  name: string;
  width?: string;
  class?: string;
  sort?: 'desc' | 'asc' | false | '';
  is_filter?: boolean;
}

interface Page {
  page: number;
  itemsPerPage: number;
}

export function sortByColumn(columnToSort: Column, data: any, columns: any, config: any, page: Page, fileFolderMode = false) {
  const sorting: Array<Column> = Object.assign({}, config.sorting).columns;
  const sorted = sorting.map((column: Column) => {
    if (columnToSort.name === column.name) {
      const newSort = column.sort === 'asc' ? 'desc' : 'asc';
      return Object.assign(column, { sort: newSort });
    } else {
      return column.sort === false ? column : Object.assign(column, { sort: '' });
    }
  });
  const handleConfig = Object.assign({}, config, { sorting: { columns: sorted } });
  return onChangeTable(handleConfig, data, columns, page, fileFolderMode);
}

export function onChangeTable(config: any, data: any, columns: any, page: Page = { page: 1, itemsPerPage: 30 }, fileFolderMode = false): any {
  const filteredData = data; //changeFilter(data, columns, config);
  const sortedData = changeSort(filteredData, config, fileFolderMode);
  const rows = (page && config.paging) ? changePage(page, sortedData) : sortedData;
  const length = sortedData.length;
  return { rows: rows, length: length };
}

export function changeFilter(data: any, columns: any, config: any): any {
  let filteredData: Array<any> = data;
  columns.forEach((column: any) => {
    if (column.filtering) {
      filteredData = filteredData.filter((item: any) => item[column.name].toLowerCase().match(column.filtering.filterString.toLowerCase()));
    }
  });
  if (!config.filtering) {
    return filteredData;
  }
  if (config.filtering.columnName) {
    return filteredData.filter((item: any) => item[config.filtering.columnName].toLowerCase().match(config.filtering.filterString.toLowerCase()));
  }
  const tempArray: Array<any> = [];
  filteredData.forEach((item: any) => {
    let flag = false;
    columns.forEach((column: any) => {
      if (column.is_filter !== false) {
        if (item[column.name] && item[column.name].toString().toLowerCase().match(config.filtering.filterString.toLowerCase())) {
          flag = true;
        }
      }
    });
    if (flag) { tempArray.push(item); }
  });
  filteredData = tempArray;
  return filteredData;
}

export function changeSort(data: any, config: any, fileFolderMode = false): any {
  if (!config.sorting) { return data; }
  const columns = config.sorting.columns || [];
  const columnWithSort: Column = columns.find((column: Column) => {
    /* Checking if sort prop exists and column needs to be sorted */
    if (column.hasOwnProperty('sort') && column.sort !== '' && column.sort !== false) { return true; }
  });
  if (!columnWithSort) { return data; }
  console.log(data)
  let sortedData = [];
  if (fileFolderMode) {
    sortedData = _.orderBy(data, ['type', columnWithSort.name], ['asc', columnWithSort.sort === 'desc' ? 'desc' : 'asc']);
  } else {
    sortedData = _.orderBy(data, [columnWithSort.name], [columnWithSort.sort === 'desc' ? 'desc' : 'asc']);
  }
  return sortedData;
}

export function changePage(page: any, data: Array<any>): Array<any> {
  const start = (page.page - 1) * page.itemsPerPage;
  const end = page.itemsPerPage > -1 ? (Number(start) + Number(page.itemsPerPage)) : data.length;
  return data.slice(start, end);
}
