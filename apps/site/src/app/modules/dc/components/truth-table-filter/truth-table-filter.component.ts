import { Component, effect, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormArray, FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { map } from 'rxjs';
import { takeUntilDestroyed } from '@angular/core/rxjs-interop';


@Component({
  selector: 'app-truth-table-filter',
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule],
  templateUrl: './truth-table-filter.component.html',
  styleUrl: './truth-table-filter.component.scss',
})
export class TruthTableFilterComponent {
  readonly filterOptions = [
    'x',
    '0',
    '1'
  ] as const;

  readonly filterForm = new FormGroup({
    filters: new FormArray<FormControl<typeof this.filterOptions[number]|null>>([])
  });

  names = input.required<string[]>();
  valuesChange = output<typeof this.filterOptions[number][]>();

  constructor() {
    effect(() => {
      this.updateFilterFormEffect();
    });

    this.filterForm.controls.filters.valueChanges.pipe(
      map((values) => {
        return values.map((value) => value ?? this.filterOptions[0]);
      }),
      takeUntilDestroyed()
    ).subscribe((values) => {
      this.valuesChange.emit(values);
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
      this.names()
    );

    filters.clear();

    newControls.forEach((control) => {
      filters.push(control);
    })
  }
}
