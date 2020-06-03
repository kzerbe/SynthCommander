import {BrowserModule} from '@angular/platform-browser';
import {RouterModule, Routes} from "@angular/router";
import {NgModule} from '@angular/core';

import {WebmidiService} from "./webmidi.service";
import {PatchfileService} from "./patchfile.service";
import {SynthmodelService} from "./synthmodel.service";

import {AppComponent} from './app.component';
import {OutputComponent, SliderMoveDirective} from "./output.component";
import {InputComponent} from "./input.component";
import {EmptyComponent} from "./empty.component";
import {HttpClientModule} from "@angular/common/http";

const routes: Routes = [
  {path: '', redirectTo: '/output', pathMatch: 'full'},
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
    BrowserModule, RouterModule.forRoot(routes,{useHash: true}), HttpClientModule
  ],
  providers: [{provide: WebmidiService}, {provide: PatchfileService}, {provide: SynthmodelService}],
  bootstrap: [AppComponent]
})
export class AppModule {
}
