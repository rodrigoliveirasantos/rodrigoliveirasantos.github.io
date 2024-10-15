import { Component, computed, signal } from '@angular/core';
import { FormControl, FormGroup, ReactiveFormsModule } from '@angular/forms';
import { RouterModule } from '@angular/router';
import { TruthTable, generateTruthTable } from '@dch/boolean-algebra';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';
import { ButtonComponent } from './modules/ui/components/button/button.component';
import { InputComponent } from './modules/ui/components/input/input.component';
import { AlertModule } from './modules/ui/components/alert/alert.component';
import { SyntaxGuideComponent } from "./modules/help/components/syntax-guide/syntax-guide.component";
import { ThuthTableComponent } from "./modules/dc/components/truth-table/truth-table.component";
import storedSignal from '../helpers/state/state';

@Component({
  standalone: true,
  imports: [
    RouterModule,
    LucideAngularModule,
    ReactiveFormsModule,
    ButtonComponent,
    InputComponent,
    AlertModule,
    SyntaxGuideComponent,
    ThuthTableComponent
  ],
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

  truthTableIsEmpty = computed(() => {
    return this.truthTable().length === 1;
  });
  
  truthTableError = signal<string|false>(false);

  showSyntaxGuide = storedSignal('showSyntaxGuide', true);

  handleFormSubmit() {
    const { expression } = this.expressionForm.value;

    if (!expression) {
      return;
    }

    const { table, error } = generateTruthTable(expression);
    
    if (table) {
      this.truthTable.set(table);
    }
    
    this.truthTableError.set(error ?? false);
  }
}
