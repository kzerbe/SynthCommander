import {BrowserModule} from '@angular/platform-browser';
import {RouterModule, Routes} from "@angular/router";
import {NgModule} from '@angular/core';

import {WebmidiService} from "./webmidi.service";
import {PatchfileService} from "./patchfile.service";

import {AppComponent} from './app.component';
import {OutputComponent, SliderMoveDirective} from "./output.component";
import {InputComponent} from "./input.component";
import {EmptyComponent} from "./empty.component";
import {HttpClientModule} from "@angular/common/http";
import {FormsModule} from "@angular/forms";

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
    BrowserModule, RouterModule.forRoot(routes), HttpClientModule
  ],
  providers: [{provide: WebmidiService}, {provide: PatchfileService}],
  bootstrap: [AppComponent]
})
export class AppModule {
}
