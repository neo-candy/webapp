import { NgModule } from '@angular/core';
import { SharedModule } from '../shared/shared.module';
import { MenuComponent } from './menu.component';
import { StepsModule } from 'primeng/steps';
import { MintComponent } from './mint/mint.component';
import { SelectButtonModule } from 'primeng/selectbutton';
import { AccordionModule } from 'primeng/accordion';

@NgModule({
  declarations: [MenuComponent, MintComponent],
  imports: [SharedModule, StepsModule, SelectButtonModule, AccordionModule],
  exports: [MenuComponent],
})
export class MenuModule {}
