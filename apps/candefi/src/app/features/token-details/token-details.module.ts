import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { TokenDetailsComponent } from './token-details.component';
import { TokenDetailsRoutingModule } from './token-details-routing.module';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { ToolbarModule } from 'primeng/toolbar';

@NgModule({
  declarations: [TokenDetailsComponent],
  imports: [
    CommonModule,
    SharedModule,
    TokenDetailsRoutingModule,
    DividerModule,
    TagModule,
    ToolbarModule,
  ],
})
export class TokenDetailsModule {}
