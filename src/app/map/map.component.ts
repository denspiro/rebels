import { AfterViewInit, Component, OnInit } from '@angular/core'
import * as Leaflet from 'leaflet'
import { AlienData, Coordinates, AliensService } from '../aliens.service'

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
  distanceToUser: (userCoordinates: Pick<Coordinates, 'lat' | 'long'>) => number
  distance: (lat1: number, lon1: number, lat2: number, lon2: number) => number
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

  public get userCoordinates (): Pick<Coordinates, 'lat' | 'long'> | null {
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
          const distanceA: number | null = a.distanceToUser({ lat: e.latlng.lat, long: e.latlng.lng })
          const distanceB: number | null = b.distanceToUser({ lat: e.latlng.lat, long: e.latlng.lng })
          return distanceA && distanceB ? distanceA - distanceB : 0
        }), CLICKS_DELAY
      )
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

  constructor (private readonly aliensService: AliensService) {}

  private getAliens (rebelCoordinates: Coordinates[]) {
    this.aliensService.getData().subscribe((aliensData: AlienData[]) => {
      // Combining `AlienData` with `Coordinates`, adding helper function to calulate distance to the user
      // to make it more convinient working with one resource insted of two independent ones.
      this._aliens = aliensData.filter((rebel: AlienData) => rebelCoordinates.some((coordinates: Coordinates) => coordinates.id === rebel.id))
        .map((rebel: AlienData) => {
          const rc: Coordinates = rebelCoordinates.find((coordinates: Coordinates) => coordinates.id === rebel.id) as Coordinates
          return {
            ...rebel,
            coordinates: { lat: rc.lat, long: rc.long },
            distanceToUser (userCoordinates: Pick<Coordinates, 'lat' | 'long'>) {
            // Calculating distance in killometers between user point and rebel point
              return this.distance(this.coordinates.lat, this.coordinates.long, userCoordinates.lat, userCoordinates.long)
            },
            distance (lat1: number, lon1: number, lat2: number, lon2: number) {
              const earthRadius: number = 6371
              function deg2rad (deg: number) {
                return deg * (Math.PI / 180)
              }
              const dLat: number = deg2rad(lat2 - lat1)
              const dLon: number = deg2rad(lon2 - lon1)
              const a: number =
              Math.sin(dLat / 2) * Math.sin(dLat / 2) +
              Math.cos(deg2rad(lat1)) * Math.cos(deg2rad(lat2)) *
              Math.sin(dLon / 2) * Math.sin(dLon / 2)
              const c: number = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a))
              const distance: number = earthRadius * c // Distance in km
              return distance
            }
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
    this.aliensService.getCoordinates().subscribe((coordinates: Coordinates[]) => { this.getAliens(coordinates) })
  }

  public ngAfterViewInit (): void {
    // Initialazing the map only after DOM is ready, to have an element to attach the map to.
    this.initMap()
  }
}
