import { Component } from '@angular/core';
import { ThemeService } from '../services/theme.service';

@Component({
  selector: 'cd-footer',
  templateUrl: './footer.component.html',
  styleUrls: ['./footer.component.scss'],
})
export class FooterComponent {
  constructor(public theme: ThemeService) {}

  switchTheme(): void {
    const newTheme =
      this.theme.current === 'lara-dark-indigo'
        ? 'lara-light-indigo'
        : 'lara-dark-indigo';
    this.theme.switchTheme(newTheme);
  }
}
