import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { SharedModule } from '../../shared/shared.module';
import { TokenDetailsComponent } from './token-details.component';
import { TokenDetailsRoutingModule } from './token-details-routing.module';

@NgModule({
  declarations: [TokenDetailsComponent],
  imports: [CommonModule, SharedModule, TokenDetailsRoutingModule],
})
export class TokenDetailsModule {}
