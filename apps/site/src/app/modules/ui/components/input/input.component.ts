import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'input[app-input], textarea[app-input]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './input.component.html',
  styleUrl: './input.component.scss',
  host: {
    class: "px-3 py-2 border-2 border-neutral-300 font-mono transition-colors focus:border-primary focus:outline-0"
  }
})
export class InputComponent {}
