import { NgModule } from '@angular/core';
import { SharedModule } from '../../shared/shared.module';
import { HomeRoutingModule } from './home-routing.module';
import { HomeComponent } from './home.component';
import { AccordionModule } from 'primeng/accordion';
import { CarouselModule } from 'primeng/carousel';
import { TabViewModule } from 'primeng/tabview';
import { TableModule } from 'primeng/table';
import { DividerModule } from 'primeng/divider';

@NgModule({
  declarations: [HomeComponent],
  imports: [
    SharedModule,
    HomeRoutingModule,
    AccordionModule,
    CarouselModule,
    TabViewModule,
    TableModule,
    DividerModule,
  ],
})
export class HomeModule {}
