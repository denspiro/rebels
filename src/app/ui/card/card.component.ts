import { Component, Input } from '@angular/core';
import { Utils, Coordinates } from 'src/app/utils';

@Component({
  selector: 'div[app-card]',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent<T
  extends { image: string, name: string, species: string, gender: string, coordinates: Coordinates }> {

  @Input() resource!: T
  @Input() targetCoordinates!: Coordinates
  @Input() isFirst!: boolean

  public Utils: typeof Utils = Utils;
}
