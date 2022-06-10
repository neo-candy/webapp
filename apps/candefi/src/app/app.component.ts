import { Component } from '@angular/core';
import { MenuItem, SelectItem } from 'primeng/api';
import { tap } from 'rxjs/operators';
import { NeolineService } from './services/neoline.service';

@Component({
  selector: 'webapp-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss'],
})
export class AppComponent {
  isLoading = false;
  address = '';
  displaySellModal = false;
  tokens: SelectItem[] = [{ label: 'bNEO', value: 'bneo' }];

  constructor(private neoline: NeolineService) {}

  connectWallet(): void {
    this.isLoading = true;
    this.neoline
      .getAccount()
      .pipe(tap((res) => (this.address = res.address)))
      .subscribe(() => (this.isLoading = false));
  }

  sell(): void {}
}
