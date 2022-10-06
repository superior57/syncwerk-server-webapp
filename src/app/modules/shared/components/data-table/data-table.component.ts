import { Component, OnInit, Input } from '@angular/core';

// import { sortByColumn, onChangeTable } from 'app/app.helpers';

interface Column {
  title: string;
  name: string;
  width?: string;
  sort?: 'desc' | 'asc' | false | '';
}

@Component({
  selector: 'app-data-table',
  templateUrl: './data-table.component.html',
  styleUrls: ['./data-table.component.scss']
})

export class DataTableComponent implements OnInit {

  // columns is array have [{ title: '', name: '', sort?: '' }, {...}, {...}, ...]
  @Input() columns: Array<any> = [];
  @Input() rows: Array<any> = [];

  config: any = {
    paging: true,
    sorting: { columns: this.columns },
    filtering: { filterString: '' },
    className: ['table-hover']
  };
  page = 1;
  itemsPerPage = 3;
  maxSize = 5;
  numPages = 1;
  length = 0;
  data: Array<any> = this.rows;

  constructor() { }

  ngOnInit() {
    this.config.sorting.columns = this.columns;
    this.data = this.rows;
    this.length = this.data.length;
    this.onChangeTable(this.config);
  }

  public sortByColumn(columnToSort: Column) {
    const sorting: Array<Column> = Object.assign({}, this.config.sorting).columns;
    const sorted = sorting.map((column: Column) => {
      if (columnToSort.name === column.name) {
        const newSort = column.sort === 'asc' ? 'desc' : 'asc';
        console.log(newSort);
        return Object.assign(column, { sort: newSort });
      } else {
        return Object.assign(column, { sort: '' });
      }
    });
    const config = Object.assign({}, this.config, { sorting: { columns: sorted } });
    this.onChangeTable(config);
  }

  public onChangeTable(config: any, page: any = { page: this.page, itemsPerPage: this.itemsPerPage }): any {
    if (config.filtering) { Object.assign(this.config.filtering, config.filtering); }
    if (config.sorting) { Object.assign(this.config.sorting, config.sorting); }
    const filteredData = this.changeFilter(this.data, this.config);
    const sortedData = this.changeSort(filteredData, this.config);
    this.rows = page && config.paging ? this.changePage(page, sortedData) : sortedData;
    this.length = sortedData.length;
  }

  public changeFilter(data: any, config: any): any {
    console.log('this config: ', this.config.filtering.filterString);
    // console.log('config: ', config.filtering.filterString);
    let filteredData: Array<any> = data;
    this.columns.forEach((column: any) => {
      if (column.filtering) {
        filteredData = filteredData.filter((item: any) => item[column.name].match(column.filtering.filterString));
      }
    });
    if (!config.filtering) { return filteredData; }
    // console.log(config.filtering);
    if (config.filtering.columnName) {
      return filteredData.filter((item: any) => item[config.filtering.columnName].match(this.config.filtering.filterString));
    }
    const tempArray: Array<any> = [];
    filteredData.forEach((item: any) => {
      let flag = false;
      this.columns.forEach((column: any) => {
        if (item[column.name].match(this.config.filtering.filterString)) {
          flag = true;
        }
      });
      if (flag) { tempArray.push(item); }
    });
    filteredData = tempArray;
    return filteredData;
  }

  public changeSort(data: any, config: any): any {
    if (!config.sorting) { return data; }
    const columns = this.config.sorting.columns || [];
    const columnWithSort: Column = columns.find((column: Column) => {
      /* Checking if sort prop exists and column needs to be sorted */
      if (column.hasOwnProperty('sort') && column.sort !== '') {
        return true;
      }
    });
    return data.sort((previous: any, current: any) => {
      if (previous[columnWithSort.name] > current[columnWithSort.name]) {
        return columnWithSort.sort === 'desc' ? -1 : 1;
      } else if (previous[columnWithSort.name] < current[columnWithSort.name]) {
        return columnWithSort.sort === 'asc' ? -1 : 1;
      }
      return 0;
    });
  }

  public changePage(page: any, data: Array<any> = this.rows): Array<any> {
    const start = (page.page - 1) * page.itemsPerPage;
    const end = page.itemsPerPage > -1 ? (start + page.itemsPerPage) : data.length;
    return data.slice(start, end);
  }

  // testNavigate() {
  //   console.log('yes');
  // }
}
