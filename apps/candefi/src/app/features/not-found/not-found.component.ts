import { Location } from '@angular/common';
import { Component } from '@angular/core';

@Component({
  templateUrl: './not-found.component.html',
})
export class NotFoundComponent {
  constructor(public location: Location) {}
}
