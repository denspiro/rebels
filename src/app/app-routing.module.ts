import { NgModule } from '@angular/core'
import { RouterModule, type Routes } from '@angular/router'
import { MapComponent } from './map/map.component'

const routes: Routes = [
  { path: '', redirectTo: '/map', pathMatch: 'full' },
  { path: 'map', component: MapComponent }
]

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
