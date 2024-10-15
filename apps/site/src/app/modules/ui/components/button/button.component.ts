import { Component, HostBinding, input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva } from 'cva';


const buttonVariants = {
  primary: "bg-primary text-primary-foreground hover:bg-secondary hover:text-secondary-foreground",
  secondary: "bg-secondary text-secondary-foreground hover:bg-neutral-600",
  inline: "p-0 text-primary hover:text-secondary"
}


const buttonVariantClass = cva(
  "inline-flex items-center justify-center p-3 font-medium transition-colors disabled:opacity-60",
  {
    variants: {
      variant: buttonVariants,
    },
    defaultVariants: {
      variant: 'primary'
    }
  }
)

@Component({
  // eslint-disable-next-line
  selector: 'button[app-button]',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './button.component.html',
  styleUrl: './button.component.scss',
})
export class ButtonComponent {
  variant = input<keyof typeof buttonVariants>("primary");

  @HostBinding('class')
  get variantClass() {
    return buttonVariantClass({ 
      variant: this.variant() 
    })
  };
}
