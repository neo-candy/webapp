import { NgModule } from '@angular/core';
import { MenubarModule } from 'primeng/menubar';
import { SharedModule } from '../shared/shared.module';
import { MenuComponent } from './menu.component';
import { TabViewModule } from 'primeng/tabview';

@NgModule({
  declarations: [MenuComponent],
  imports: [MenubarModule, SharedModule, TabViewModule],
  exports: [MenuComponent],
})
export class MenuModule {}
