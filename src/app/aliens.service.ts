import { HttpClient, HttpErrorResponse } from '@angular/common/http'
import { Injectable } from '@angular/core'
import { Observable, throwError } from 'rxjs'
import { catchError, map, retry } from 'rxjs/operators'

export interface Coordinates {
  id: number
  lat: number
  long: number
}

export interface AlienData {
  id: number
  name: string
  height: number
  mass: number
  gender: string
  homeworld: string
  wiki: string
  image: string
  born: number
  died: number
  diedLocation: string
  species: string
  hairColor: string
  eyeColor: string
  skinColor: string
  cybernetics: string
  affiliations: string[]
  masters: string[]
  apprentices: string[]
  formerAffiliations: string[]
}

export interface Message {
  message: string
}

@Injectable({
  providedIn: 'root'
})
export class AliensService {
  // First checking client-side or network error, then if backend returned unsuccessful response code,
  // finally returning an observable with a user-facing error message.
  private errorHandler (error: HttpErrorResponse): Observable<never> {
    error.status === 0
      ? console.error('An error occurred:', error.error)
      : console.error(
          `Backend returned code ${error.status}, body was: `,
          error.error
      )
    return throwError(
      () => new Error('Something bad happened; please try again later.')
    )
  }

  private get<T>(url: string): Observable<T> {
    return (this.http.get(url) as Observable<T>).pipe(
      retry(3),
      catchError(this.errorHandler)
    ) // Retrying a failed request up to 3 times then handle error
  }

  constructor (private readonly http: HttpClient) {}

  public getCoordinates (): Observable<Coordinates[]> {
    return this.get<Message>(
      'https://aseevia.github.io/star-wars-frontend/data/secret.json'
    ).pipe(map(({ message }: Message) => JSON.parse(atob(message))))
  }

  public getData (): Observable<AlienData[]> {
    // In a scenario where latency is high but the bandwidth is adequate, making numerous small API
    // requests could be less efficient than making a single large one. The reason behind this is the overhead
    // that comes with each request, which involves setting up and tearing down connections.
    return this.get<AlienData[]>(
      'https://rawcdn.githack.com/akabab/starwars-api/0.2.1/api/all.json'
    )
  }
}
