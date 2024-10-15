import { Component, computed, effect, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { toSignal } from '@angular/core/rxjs-interop'
import { TruthTable } from '@dch/boolean-algebra';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { map } from 'rxjs';

@Component({
  selector: 'app-thuth-table',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './truth-table.component.html',
  styleUrl: './truth-table.component.scss',
})
export class ThuthTableComponent {
  readonly filterOptions = [
    'x',
    '0',
    '1'
  ];

  readonly filterForm = new FormGroup({
    filters: new FormArray<FormControl<string|null>>([])
  });

  table = input.required<TruthTable>();
  
  head = computed(() => {
    return this.table()[0]
  });

  body = computed(() => {
    const rows = this.table().slice(1);
    const filters = this.filtersValues();

    return rows.filter((row) => {
      return row.every((cell, i) => {
        if (filters[i] === this.filterOptions[0]) {
          return true;
        }

        /* == Aqui é proposital porque, embora os valores possíveis dos filtros e das 
        células sejam os mesmos (0 ou 1), o tipo é diferente. */
        return cell == filters[i]
      })
    });
  });

  filtersValues = toSignal(
    this.filterForm.controls.filters.valueChanges.pipe(
      map((values) => {
        return values.map((value) => value ?? this.filterOptions[0]);
      })
    ),
    { initialValue: [] }
  );

  constructor() {
    effect(() => {
      this.updateFilterFormEffect();
    });
  }
  
  /* 
   * Em vez de consumir diretamente o signal head(),
   * aceita um valor como parâmetro para que a dependência fique
   * mais explicita.
   */
  public createFilterControls(varNames: string[]) {
    const controls = varNames.map(() => {
      return new FormControl(this.filterOptions[0])
    })
   
    return controls
  }

  public updateFilterFormEffect() {
    const filters = this.filterForm.controls.filters;
    const newControls = this.createFilterControls(
      this.head()
    );

    filters.clear();

    newControls.forEach((control) => {
      filters.push(control);
    })
  }
}
