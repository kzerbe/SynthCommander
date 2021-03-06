import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {WebmidiService} from "./webmidi.service";
import {Output} from "webmidi";
import {SynthmodelService} from "./synthmodel.service";

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <h1>{{title}}</h1>
      <div class="form">
        <div class="form-group col-4">
          <label for="devicelist">select MIDI output device</label>
          <select id="devicelist" class="form-control" (change)="onOutputChange($event.target)">
            <option *ngFor="let output of outputs$ | async; let idx=index" value={{idx}}>{{output.name}}</option>
          </select>
        </div>
        <div class="form-group col-4">
          <label for="devicemodel">synthesizer model</label>
          <select id="devicemodel" class="form-control" (change)="onModelChange($event.target)">
            <option [value]="null">choose model</option>
            <option *ngFor="let model of models$ | async" value={{model}}>{{model}}</option>
          </select>
        </div>
      </div>
      <div *ngIf="error" class="alert alert-danger">{{error}}</div>
      <nav class="navbar navbar-expand-sm bg-light">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" routerLink="info" routerLinkActive="active">Info</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="input" routerLinkActive="active">Monitor MIDI input</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="output" routerLinkActive="active">Control MIDI output</a>
          </li>
        </ul>
      </nav>
      <router-outlet></router-outlet>
    </div>
  `,
  styles: []
})
export class AppComponent implements OnInit {
  title = 'Synth Commander';
  outputs$: Observable<Output[]>;
  models$: Observable<string[]>;
  error: string;

  constructor(private midiService: WebmidiService, private synthmodelService: SynthmodelService) {
  }

  ngOnInit(): void {
    this.outputs$ = this.midiService.outputs$;
    this.models$ = this.synthmodelService.listModels();
    this.midiService.error$.subscribe(err => this.error = err);
  }

  onOutputChange(target: any) {
    let idx = parseInt(target.value, 10);
    this.midiService.setOutput(idx);
    this.midiService.setInput(idx);
  }

  onModelChange(target: any) {
    const model = (target as HTMLInputElement).value;
    this.synthmodelService.loadModel(model);
  }
}
