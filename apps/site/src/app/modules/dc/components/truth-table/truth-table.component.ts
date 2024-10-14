import { ChangeDetectionStrategy, Component, computed, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { TruthTable } from '@dch/boolean-algebra';

@Component({
  selector: 'app-thuth-table',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './truth-table.component.html',
  styleUrl: './truth-table.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush
})
export class ThuthTableComponent {
  table = input.required<TruthTable>();
  
  head = computed(() => {
    return this.table()[0]
  });

  body = computed(() => {
    return this.table().slice(1);
  })
}
