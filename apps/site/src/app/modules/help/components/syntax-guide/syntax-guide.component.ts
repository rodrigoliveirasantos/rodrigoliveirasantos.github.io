import { ChangeDetectionStrategy, Component, input, output } from '@angular/core';
import { CommonModule } from '@angular/common';
import { LucideAngularModule, X } from 'lucide-angular';
import { AlertModule } from '../../../ui/components/alert/alert.component';

@Component({
  selector: 'app-syntax-guide',
  standalone: true,
  imports: [CommonModule, LucideAngularModule, AlertModule],
  changeDetection: ChangeDetectionStrategy.OnPush,
  templateUrl: './syntax-guide.component.html',
  styleUrl: './syntax-guide.component.scss',
})
export class SyntaxGuideComponent {
  readonly closeIcon = X;

  dismissable = input(true);
  close = output();
}
