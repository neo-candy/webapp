import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { AccordionModule } from 'primeng/accordion';

@NgModule({
  declarations: [HomeComponent],
  imports: [SharedModule, HomeRoutingModule, AccordionModule],
})
export class HomeModule {}
