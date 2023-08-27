import { AfterViewInit, Component, OnInit } from '@angular/core'
import * as Leaflet from 'leaflet'
import { AlienData, AlienCoordinates, AliensService } from '../aliens.service'
import { Utils, Coordinates } from 'src/app/utils';

const CLICKS_DELAY: number = 100

interface MarkerData {
  lat: number
  long: number
  image: string
  size: number
  backgroundColor: string
  borderColor: string
}

export interface Alien extends AlienData {
  coordinates: { lat: number, long: number }
}

@Component({
  selector: 'app-map',
  templateUrl: './map.component.html',
  styleUrls: ['./map.component.scss']
})
export class MapComponent implements AfterViewInit, OnInit {
  private map!: Leaflet.Map
  private _userMarker!: Leaflet.Marker
  private _aliens!: Alien[]

  public get userCoordinates (): Coordinates | null {
    const coordinates: Leaflet.LatLng = this._userMarker?.getLatLng()
    return coordinates ? { lat: coordinates.lat, long: coordinates.lng } : null
  }

  public get aliens (): Alien[] {
    return this._aliens
  }

  private initMap (): void {
    let debounce: ReturnType<typeof setTimeout> | null = null

    this.map = Leaflet.map('map', {
      maxZoom: 10,
      minZoom: 3.2,
      maxBounds: [[-80, -170], [85, 167]],
      maxBoundsViscosity: 1.0,
      preferCanvas: true
    })

    Leaflet.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
      noWrap: true
    }).addTo(this.map)

    this.map.setView([50, 40], 1)

    // Adding or updating user `Marker`
    this.map.on('click', (e) => {
      if (!this._userMarker) {
        this._userMarker = this.createMarker({
          lat: e.latlng.lat,
          long: e.latlng.lng,
          image: '',
          size: 20,
          backgroundColor: '#F1809B',
          borderColor: '#EF476F'
        })
        this._userMarker.addTo(this.map)
      } else {
        this._userMarker.setLatLng([e.latlng.lat, e.latlng.lng])
      }
      // Sets the view of the map (geographical center and zoom) with the given animation options.
      this.map.setView([e.latlng.lat, e.latlng.lng])

      // Small optimization for multiple repeated clicks.
      if (debounce) {
        clearTimeout(debounce)
      }
      debounce = setTimeout(() =>
        // Sorting aliens according to their distance form the user
        this._aliens.sort((a: Alien, b: Alien) => {
          const distanceA: number | null = Utils.distanceBetween(a.coordinates, { lat: e.latlng.lat, long: e.latlng.lng })
          const distanceB: number | null = Utils.distanceBetween(b.coordinates, { lat: e.latlng.lat, long: e.latlng.lng })
          return distanceA && distanceB ? distanceA - distanceB : 0
        }), CLICKS_DELAY)
    })
  }

  // Creating markers on the map and extending metadata with `rebelId`
  private createMarker (marker: MarkerData): Leaflet.Marker {
    const imageStyle: string = `
      width: ${marker.size}px;`
    const imageContainerStyle: string = `
      overflow: hidden;
      background-color: ${marker.backgroundColor};
      outline: 3px solid ${marker.borderColor};
      height: inherit;
      border-radius: 50%;`
    const icon: Leaflet.DivIcon = Leaflet.divIcon({
      iconSize: [marker.size, marker.size],
      className: 'circular-marker',
      iconAnchor: [0, 24],
      html: `
      <div style="${imageContainerStyle}">
        <img src="${marker.image}" style="${imageStyle}"></img>
      </div>`
    })
    return new Leaflet.Marker([marker.lat, marker.long], { icon })
  }

  constructor(private readonly aliensService: AliensService) {}

  private getAliens (rebelCoordinates: AlienCoordinates[]) {
    this.aliensService.getData().subscribe((aliensData: AlienData[]) => {
      // Combining `AlienData` with `Coordinates` to make it more convinient working
      // with one resource insted of two independent ones.
      this._aliens = aliensData.filter((rebel: AlienData) => rebelCoordinates
        .some((coordinates: AlienCoordinates) => coordinates.id === rebel.id))
        .map((rebel: AlienData) => {
          const rc: AlienCoordinates = rebelCoordinates
            .find((coordinates: AlienCoordinates) => coordinates.id === rebel.id) as AlienCoordinates
          return {
            ...rebel,
            coordinates: { lat: rc.lat, long: rc.long },
          }
        })
      this._aliens.forEach((r: Alien) => this.createMarker({
        lat: r.coordinates.lat,
        long: r.coordinates.long,
        image: r.image,
        size: 50,
        backgroundColor: '#FFFFFF',
        borderColor: '#00C5A4'
      }).addTo(this.map))
    })
  }

  public ngOnInit (): void {
    this.aliensService.getCoordinates().subscribe((coordinates: AlienCoordinates[]) => { this.getAliens(coordinates) })
  }

  public ngAfterViewInit (): void {
    // Initialazing the map only after DOM is ready, to have an element to attach the map to.
    this.initMap()
  }
}
