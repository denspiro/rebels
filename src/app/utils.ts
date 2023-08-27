export interface Coordinates {
  lat: number
  long: number
}

export class Utils {
  public static distanceBetween({lat: latA, long: longA }: Coordinates, {lat: latB, long: longB}: Coordinates ): number {
    return Math.floor(this.distance(latA, longA, latB, longB));
  }

  private static distance(lat1: number, lon1: number, lat2: number, lon2: number): number {
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
