import {Component, Directive, HostListener} from '@angular/core';
import {Observable} from "rxjs";

import {controls} from "./controlModel";
import {Output} from "webmidi";
import {WebmidiService} from "./webmidi.service";
import {PatchfileService, IControlParameter} from "./patchfile.service";
import {isEmpty} from "rxjs/operators";

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
      <br/>
      <h4>Patch Storage</h4>
      <div class="form">
        <div class="form-group row">
          <label class="col-form-label col-2 text-right" for="patchname">new patchname</label>
          <input type="text" class="form-control col-4 mr-2" id="patchname" (input)="updatePatchName($event.target.value)"/>
          <button class="btn btn-primary col-2 btn-sm" (click)="onSavePatch()">Save</button>
        </div>
        <div class="form-group row">
          <label class="col-form-label col-2 text-right" for="selectpatch">select patch</label>
          <select class="form-control col-4 mr-2" id="selectpatch" (change)="onSelectPatchname($event.target)">
            <option *ngFor="let patch of patchfiles | async" [value]="patch">{{patch}}</option>
          </select>
          <button class="btn btn-primary col-2" (click)="onLoadPatch()">Load</button>
        </div>
      </div>
      <br/>
      <h4>Control Change</h4>
      <div class="row" *ngFor="let control of ctx; let idx2=index">
        <label for=rv{{idx2}} class="col-4 text-right" >{{control.mod}}&nbsp;{{control.attr}}</label>
        <input type="range" id=rv{{idx2}} class="col-4" value="0" min="0" max="127"
               (input)="onChangeControl(idx2, $event.target)" slidermove>
        <span class="col-1">0</span>
      </div>
    </div>
  `,
  styles: ['text-right {justify-content: right}']
})
export class OutputComponent {
  ctx = controls;
  output: Observable<Output>;
  error = '';
  testNote = 46;
  playing = false;
  patchfiles: Observable<string[]>;
  currentPatch = '';
  patchname = '';
  controlParameters: {[index: number]: IControlParameter} = {};

  constructor(private midiService: WebmidiService, private patchService: PatchfileService) {
    this.output = midiService.currentOutput;
    midiService.error.subscribe(err => {
      this.error = err
    });
    this.patchfiles = patchService.getPatchfiles();
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
    this.controlParameters[controlIdx] = {parameterId: control, value:  parseInt(value.value, 10)};

    if (this.output.pipe(isEmpty())) {
      return;
    }

    this.output.subscribe(output => {
      output.sendControlChange(control, value.value, 1);
    });
  }

  updatePatchName(value: string) {
    this.patchname = value;
  }

  onSelectPatchname(target) {
    this.currentPatch = target.value;
  }

  onLoadPatch() {

  }

  onSavePatch() {
    if (!this.patchname) {
      return;
    }

    let patch ={patchname: this.patchname, data: []};
    for (let parameter of Object.values(this.controlParameters)) {
      patch.data.push(parameter)
    }
    this.patchService.savePatchFile(patch);
  }
 }
