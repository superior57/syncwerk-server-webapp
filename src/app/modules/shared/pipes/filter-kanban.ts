import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
    name: 'filter_kanban',
    pure: false
})

export class FilterKanban implements PipeTransform {
  transform(value: any, query: string, field: string): any {
      return query ? value.reduce((prev, next) => {
        if (next[field].toLowerCase().includes(query.toLowerCase())) { prev.push(next); }
        return prev;
      }, []) : value;
    }
}
