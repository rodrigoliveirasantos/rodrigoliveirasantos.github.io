import { Component, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { CompileError, TruthTable, generateTruthTable } from '@dch/boolean-algebra';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { ButtonComponent } from './modules/ui/components/button/button.component';
import { InputComponent } from './modules/ui/components/input/input.component';

@Component({
  standalone: true,
  imports: [RouterModule, LucideAngularModule, ReactiveFormsModule, ButtonComponent, InputComponent],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'site';

  readonly submitBtnIcon = ArrowRight;

  readonly expressionForm = new FormGroup({
    expression: new FormControl('')
  })

  truthTable = signal<TruthTable>([
    []
  ]);

  truthTableHead = computed(() => {
    return this.truthTable()[0];
  })

  truthTableBody = computed(() => {
    return this.truthTable().slice(1);
  })

  truthTableIsEmpty = computed(() => {
    return this.truthTable().length === 1;
  });
  
  truthTableError = signal<string|false>(false);

  handleFormSubmit() {
    const { expression } = this.expressionForm.value;

    if (!expression) {
      return;
    }

    const { table, error } = generateTruthTable(expression);
    
    if (table) {
      this.truthTable.set(table);
    }
    
    if (error === undefined) {
      this.truthTableError.set(false);
    } else {
      this.truthTableError.set(error instanceof CompileError ? error.reason : error);
    }

  }
}
