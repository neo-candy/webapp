import { NgModule } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { SharedModule } from '../shared/shared.module';
import { MenuComponent } from './menu.component';
import { TabViewModule } from 'primeng/tabview';
import { OverlayPanelModule } from 'primeng/overlaypanel';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';

@NgModule({
  declarations: [MenuComponent],
  imports: [
    MenubarModule,
    SharedModule,
    TabViewModule,
    OverlayPanelModule,
    ReactiveFormsModule,
    CheckboxModule,
    SliderModule,
  ],
  exports: [MenuComponent],
})
export class MenuModule {}
