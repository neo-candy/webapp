import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';

import { MintRoutingModule } from './mint-routing.module';
import { MintComponent } from './mint.component';
import { SharedModule } from '../../shared/shared.module';
import { ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';

@NgModule({
  declarations: [MintComponent],
  imports: [
    CommonModule,
    MintRoutingModule,
    SharedModule,
    ReactiveFormsModule,
    CheckboxModule,
    SliderModule,
  ],
  exports: [MintComponent],
})
export class MintModule {}
