import {Component, OnInit} from '@angular/core';
import {Observable} from "rxjs";
import {WebMidiService} from "./WebMidiService";
import {Output} from "webmidi";

@Component({
  selector: 'app-root',
  template: `
    <div class="container">
      <h1>{{title}}</h1>
      <div class="form-group" *ngIf="!error; else err">
        <label for="devicelist">select MIDI output device</label>
        <select id="devicelist" class="form-control col-4" (change)="onOutputChange($event.target)">
          <option *ngFor="let output of outputs | async; let idx=index" value={{idx}}>{{output.name}}</option>
        </select>
      </div>
      <ng-template #err>
        <div class="alert alert-danger">{{error}}</div>
      </ng-template>
      <nav class="navbar navbar-expand-sm bg-light">
        <ul class="navbar-nav">
          <li class="nav-item">
            <a class="nav-link" routerLink="info">Info</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="input">Monitor MIDI input</a>
          </li>
          <li class="nav-item">
            <a class="nav-link" routerLink="output">Control MIDI output</a>
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
  outputs: Observable<Output[]>;
  error: string;

  constructor(private midiService: WebMidiService) {
  }

  ngOnInit(): void {
    this.outputs = this.midiService.outputs;
    this.midiService.error.subscribe(err => this.error = err);
  }

  onOutputChange(target: any) {
    let idx = parseInt(target.value, 10);
    this.midiService.setOutput(idx);
    this.midiService.setInput(idx);
  }
}
