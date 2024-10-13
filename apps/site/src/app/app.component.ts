import { Component, signal } from '@angular/core';
import { RouterModule } from '@angular/router';
import { ArrowRight, LucideAngularModule } from 'lucide-angular';


@Component({
  standalone: true,
  imports: [RouterModule, LucideAngularModule],
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrl: './app.component.scss',
})
export class AppComponent {
  title = 'site';

  readonly submitBtnIcon = ArrowRight;

  truthyTable = signal([])
}
