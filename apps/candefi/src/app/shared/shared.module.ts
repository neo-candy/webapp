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
import { ReactiveFormsModule } from '@angular/forms';
import { CheckboxModule } from 'primeng/checkbox';
import { SliderModule } from 'primeng/slider';
import { MonitorComponent } from './components/monitor/monitor.component';
import { MenubarModule } from 'primeng/menubar';
import { ToolbarModule } from 'primeng/toolbar';
import { CdTimerModule } from 'angular-cd-timer';

@NgModule({
  declarations: [TruncateAddressPipe, MonitorComponent],
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
    ReactiveFormsModule,
    CheckboxModule,
    SliderModule,
    MenubarModule,
    ToolbarModule,
    CdTimerModule,
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
    ReactiveFormsModule,
    CheckboxModule,
    SliderModule,
    MonitorComponent,
    MenubarModule,
    ToolbarModule,
    CdTimerModule,
  ],
})
export class SharedModule {}
