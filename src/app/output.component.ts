import {Component, Directive, HostListener} from '@angular/core';
import {controls} from "./controlModel";
import {Output} from "webmidi";
import {WebMidiService} from "./WebMidiService";
import {Observable} from "rxjs";

@Directive({
  selector: '[slidermove]'
})
export class SliderMoveDirective {
  @HostListener('input', ['$event']) onSliderMove($event) {
    let target = $event.target.nextSibling;
    target.textContent = $event.target.value;
  }
}

@Component({
  selector: 'app-output',
  template: `
    <div *ngIf="!error">
      <h4>Tone selection</h4>
      <div class="row">
        <input type="range" class="col-9" min="46" max="92" [value]="testNote"
               (input)="onNoteChange($event.target)" slidermove>
        <span class="col-1">{{testNote}}</span>
        <button [disabled]="!playing" class="btn btn-primary col-2" (click)="onMute()">mute</button>
      </div>
      <h4>Control Change</h4>
      <div class="row" *ngFor="let control of ctx; let idx2=index">
        <label for=rv{{idx2}} class="col-4">{{control.mod}}&nbsp;{{control.attr}}</label>
        <input type="range" id=rv{{idx2}} class="col-4" value="0" min="0" max="127"
               (input)="onChangeControl(idx2, $event.target)" slidermove>
        <span class="col-1">0</span>
      </div>
    </div>
  `,
  styles: []
})
export class OutputComponent {
  ctx = controls;
  output: Observable<Output>;
  error = '';
  testNote = 46;
  playing = false;

  constructor(private midiService: WebMidiService) {
    this.output = midiService.currentOutput;
    midiService.error.subscribe(err => {
      this.error = err
    });
  }

  onNoteChange(target: any) {
    this.output.subscribe(output => {
      if (this.playing) {
        output.stopNote(this.testNote, 1);
      }

      this.testNote = parseInt(target.value, 10);

      output.playNote(this.testNote, 1);
      this.playing = true;
    });
  }

  onMute() {
    if (this.playing) {
      this.output.subscribe(output => {
        output.stopNote(this.testNote, 1);
        this.playing = false;
      });
    }
  }

  onChangeControl(controlIdx: number, value) {
    let control = this.ctx[controlIdx].key;
    this.output.subscribe(output => {
      output.sendControlChange(control, value.value, 1);
    });
  }
}
