import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { MenuComponent } from './menu.component';
import { TabViewModule } from 'primeng/tabview';
import { OverlayPanelModule } from 'primeng/overlaypanel';

@NgModule({
  declarations: [MenuComponent],
  imports: [SharedModule, TabViewModule, OverlayPanelModule],
  exports: [MenuComponent],
})
export class MenuModule {}
