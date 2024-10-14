import { ChangeDetectionStrategy, Component, HostBinding, input, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { cva } from 'cva';


const alertVariants = {
  normal: "bg-neutral-300",
  destructive: "bg-destructive text-destructive-foreground"
}

const alertVariantClass = cva(
  "p-3",
  {
    variants: {
      variant: alertVariants
    },
    defaultVariants: {
      variant: 'normal'
    }
  }
)


@Component({
  selector: '[app-alert-title]',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "font-bold font-lg"
  }
})
export class AlertTitleComponent {}


@Component({
  selector: '[app-alert-header]',
  template: '<ng-content />',
  changeDetection: ChangeDetectionStrategy.OnPush,
  host: {
    class: "flex items-center justify-between mb-2"
  }
})
export class AlertHeaderComponent {}

@Component({
  selector: '[app-alert]',
  templateUrl: './alert.component.html',
  styleUrl: './alert.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class AlertComponent {
  variant = input<keyof typeof alertVariants>('normal');

  @HostBinding('class')
  get variantClass() {
    return alertVariantClass({ variant: this.variant() });
  }
}


@NgModule({
  declarations: [
    AlertTitleComponent,
    AlertHeaderComponent,
    AlertComponent
  ],
  imports: [
    CommonModule
  ],
  exports: [
    AlertTitleComponent,
    AlertHeaderComponent,
    AlertComponent
  ]
})
export class AlertModule {}
