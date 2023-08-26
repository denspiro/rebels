import { Component, Input } from '@angular/core';
import { Coordinates } from 'src/app/aliens.service';
import { Alien } from 'src/app/map/map.component';

@Component({
  selector: 'div[app-card]',
  templateUrl: './card.component.html',
  styleUrls: ['./card.component.scss']
})
export class CardComponent {
  @Input() alien!: Alien
  @Input() userCoordinates!: Pick<Coordinates, 'lat' | 'long'>
  @Input() isFirst!: boolean
  public Math: typeof Math = Math
}
