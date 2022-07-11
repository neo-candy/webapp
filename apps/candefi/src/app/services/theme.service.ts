import { DOCUMENT } from '@angular/common';
import { Inject, Injectable } from '@angular/core';
import { ContextService, THEME_CTX_KEY } from './context.service';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  constructor(
    @Inject(DOCUMENT) private document: Document,
    private context: ContextService
  ) {}

  current = 'lara-light-indigo';

  switchTheme(theme: string) {
    const themeLink = this.document.getElementById(
      'app-theme'
    ) as HTMLLinkElement;
    if (themeLink) {
      themeLink.href = theme + '.css';
      this.current = theme;
      this.context.put(THEME_CTX_KEY, theme);
    }
  }
}
