import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ButtonModule } from 'primeng/button';
import { FormsModule } from '@angular/forms';
import { DialogModule } from 'primeng/dialog';
import { DropdownModule } from 'primeng/dropdown';
import { InputNumberModule } from 'primeng/inputnumber';
import { TableModule } from 'primeng/table';
import { InputTextModule } from 'primeng/inputtext';
import { TruncateAddressPipe } from '../pipes/truncateAddress.pipe';
import { PanelModule } from 'primeng/panel';
import { TabViewModule } from 'primeng/tabview';

@NgModule({
  declarations: [TruncateAddressPipe],
  imports: [
    CommonModule,
    ButtonModule,
    FormsModule,
    DialogModule,
    DropdownModule,
    InputNumberModule,
    TableModule,
    InputTextModule,
    PanelModule,
    TabViewModule,
  ],
  exports: [
    CommonModule,
    ButtonModule,
    FormsModule,
    DialogModule,
    DropdownModule,
    InputNumberModule,
    TableModule,
    InputTextModule,
    TruncateAddressPipe,
    PanelModule,
    TabViewModule,
  ],
})
export class SharedModule {}
