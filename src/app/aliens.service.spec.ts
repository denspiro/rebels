import { TestBed } from '@angular/core/testing'

import { AliensService } from './aliens.service'

describe('AliensService', () => {
  let service: AliensService

  beforeEach(() => {
    TestBed.configureTestingModule({})
    service = TestBed.inject(AliensService)
  })

  it('should be created', () => {
    expect(service).toBeTruthy()
  })
})
