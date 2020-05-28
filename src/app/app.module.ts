import {BrowserModule} from '@angular/platform-browser';
import {RouterModule, Routes} from "@angular/router";
import {NgModule} from '@angular/core';

import {WebMidiService} from "./WebMidiService";

import {AppComponent} from './app.component';
import {OutputComponent, SliderMoveDirective} from "./output.component";
import {InputComponent} from "./input.component";
import {EmptyComponent} from "./empty.component";

const routes: Routes = [
  {path: '', redirectTo: '/info', pathMatch: 'full'},
  {path: 'info', component: EmptyComponent},
  {path: 'input', component: InputComponent},
  {path: 'output', component: OutputComponent}
];

@NgModule({
  declarations: [
    AppComponent, SliderMoveDirective, InputComponent, OutputComponent,
    EmptyComponent
  ],
  imports: [
    BrowserModule, RouterModule.forRoot(routes)
  ],
  providers: [{provide: WebMidiService}],
  bootstrap: [AppComponent]
})
export class AppModule {
}
