import { Component, computed, input, signal } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruthTable } from '@dch/boolean-algebra';
import { ReactiveFormsModule } from '@angular/forms';
import { TruthTableFilterComponent } from "../truth-table-filter/truth-table-filter.component";

@Component({
  selector: 'app-thuth-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, TruthTableFilterComponent],
  templateUrl: './truth-table.component.html',
  styleUrl: './truth-table.component.scss',
})
export class ThuthTableComponent {
  table = input.required<TruthTable>();
  
  filtersValues = signal<string[]>([]);

  head = computed(() => {
    return this.table()[0]
  });

  body = computed(() => {
    const rows = this.table().slice(1);
    const filters = this.filtersValues();

    return rows.filter((row) => {
      return row.every((cell, i) => {
        if (filters[i] === 'x') {
          return true;
        }

        /* == Aqui é proposital porque, embora os valores possíveis dos filtros e das 
        células sejam os mesmos (0 ou 1), o tipo é diferente. */
        return cell == filters[i]
      })
    });
  });

  handleFiltersChange(event: string[]) {
    this.filtersValues.set(event);
  }
}
