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
import { MenuModule } from 'primeng/menu';
import { DividerModule } from 'primeng/divider';
import { TagModule } from 'primeng/tag';
import { AuthGuard } from './guards/auth.guard';
import { ProfitCalculatorComponent } from './components/profit-calculator/profit-calculator.component';
import { FieldsetModule } from 'primeng/fieldset';
import { SelectButtonModule } from 'primeng/selectbutton';
import { ProfitCalculatorTableComponent } from './components/profit-calculator/project-calculator-table/profit-calculator-table.component';
import { RentDetailsComponent } from './components/rent-details/rent-details.component';
import { TooltipModule } from 'primeng/tooltip';
import { ClipboardModule } from 'ngx-clipboard';

@NgModule({
  declarations: [
    TruncateAddressPipe,
    MonitorComponent,
    ProfitCalculatorComponent,
    ProfitCalculatorTableComponent,
    RentDetailsComponent,
  ],
  providers: [AuthGuard],
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
    MenuModule,
    DividerModule,
    TagModule,
    FieldsetModule,
    SelectButtonModule,
    TooltipModule,
    ClipboardModule,
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
    FieldsetModule,
    TooltipModule,
    MenuModule,
    DividerModule,
    TagModule,
    SelectButtonModule,
    ProfitCalculatorComponent,
    ProfitCalculatorTableComponent,
    RentDetailsComponent,
    ClipboardModule,
  ],
})
export class SharedModule {}
