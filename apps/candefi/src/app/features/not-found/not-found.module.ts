import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';
import { NotFoundComponent } from './not-found.component';
import { NotFoundRoutingModule } from './not-found-routing.module';

@NgModule({
  declarations: [NotFoundComponent],
  imports: [
    CommonModule,
    SharedModule,
    DividerModule,
    TagModule,
    ToolbarModule,
    NotFoundRoutingModule,
  ],
})
export class NotFoundModule {}
