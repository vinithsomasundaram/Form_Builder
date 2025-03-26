import { Pipe, PipeTransform } from '@angular/core';

@Pipe({
  name: 'filterElements'
})
export class FilterElementsPipe implements PipeTransform {

  transform(items: any[], searchTerm: string): any[] {
    if (!items || !searchTerm) return items;

    const term = searchTerm.toLowerCase();

    return items.filter(item =>
      item.displayName?.toLowerCase().includes(term) ||
      item.type?.toLowerCase().includes(term)
    );
  }
}
