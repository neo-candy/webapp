import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MintRoutingModule } from './mint-routing.module';
import { MintComponent } from './mint.component';
import { SharedModule } from '../../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';

@NgModule({
  declarations: [MintComponent],
  imports: [CommonModule, MintRoutingModule, SharedModule, ReactiveFormsModule],
  exports: [MintComponent],
})
export class MintModule {}
