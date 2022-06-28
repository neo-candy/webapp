import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { TruncateAddressPipe } from '../pipes/truncateAddress.pipe';

@NgModule({
  declarations: [TruncateAddressPipe],
  imports: [CommonModule, ButtonModule],
  exports: [CommonModule, ButtonModule, TruncateAddressPipe],
})
export class SharedModule {}
