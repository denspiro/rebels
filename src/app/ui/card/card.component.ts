import { Component, Input } from '@angular/core';
import { Alien } from 'src/app/map/map.component';
import { Utils, Coordinates } from 'src/app/utils';

@Component({
  selector: 'div[app-card]',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {

  @Input() resource!: Alien
  @Input() targetCoordinates!: Coordinates
  @Input() isFirst!: boolean

  public Utils: typeof Utils = Utils;
}
