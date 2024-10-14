import { ChangeDetectionStrategy, Component, NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

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
  host: {
    class: "p-3 bg-neutral-300"
  }
})
export class AlertComponent {}


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
