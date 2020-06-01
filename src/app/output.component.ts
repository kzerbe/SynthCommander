import {Component, Directive, HostListener, OnInit} from '@angular/core';
import {Observable} from "rxjs";

import {controls} from "./controlModel";
import {Output} from "webmidi";
import {WebmidiService} from "./webmidi.service";
import {PatchfileService, IControlParameter} from "./patchfile.service";


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
    <div *ngIf="!!error" class="alert alert-info" [textContent]="error"></div>
    <h4>Tone selection</h4>
    <div class="row">
      <input type="range" class="col-9" min="46" max="92" [value]="testNote"
             (input)="onNoteChange($event)" slidermove>
      <span class="col-1">{{testNote}}</span>
      <button [disabled]="!playing" class="btn btn-primary col-2" (click)="onMute()">mute</button>
    </div>
    <br/>
    <h4>Patch Storage</h4>
    <div class="form">
      <div class="form-group row">
        <label class="col-form-label col-2 text-right" for="patchname">new patchname</label>
        <input type="text" class="form-control col-4 mr-2" id="patchname" (input)="updatePatchName($event)"/>
        <button class="btn btn-primary col-2 btn-sm" (click)="onSavePatch()">Save</button>
      </div>
      <div class="form-group row">
        <label class="col-form-label col-2 text-right" for="selectpatch">select patch</label>
        <select class="form-control col-4 mr-2" id="selectpatch" (change)="onSelectPatchname($event)">
          <option *ngFor="let patch of patchfiles | async" [value]="patch">{{patch}}</option>
        </select>
        <button class="btn btn-primary col-2" (click)="onLoadPatch()">Load</button>
      </div>
    </div>
    <br/>
    <h4>Control Change</h4>
    <div class="row" *ngFor="let control of ctx; let idx2=index">
      <label for=rv{{idx2}} class="col-4 text-right" >{{control.mod}}&nbsp;{{control.attr}}</label>
      <input type="range" id=rv{{idx2}} class="col-4" min="0" max="127"
             [value]="controlValues[idx2]" (input)="onChangeControl(idx2, $event)" slidermove>
      <span [textContent]="controlValues[idx2]" class="col-1">0</span>
    </div>
  `,
  styles: ['text-right {justify-content: right}']
})
export class OutputComponent implements OnInit {
  ctx = controls;
  controlValues: number[] = [];

  output: Output;
  hasOutput = false;
  error = '';
  testNote = 46;
  playing = false;
  patchfiles: Observable<string[]>;
  currentPatch = '';
  patchname = '';
  controlParameters: {[index: number]: IControlParameter} = {};

  constructor(private midiService: WebmidiService, private patchService: PatchfileService) {
    this.patchfiles = patchService.getPatchfiles();
    for(let c in controls) {
      this.controlValues.push(0);
    }
  }

  ngOnInit()
  {
   this.midiService.currentOutput.subscribe(output => this.output=output);
  }

  onNoteChange(event: Event) {
    if (this.playing) {
      this.output.stopNote(this.testNote, 1);
    }

    this.testNote = parseInt((event.target as HTMLInputElement).value, 10);
    this.output.playNote(this.testNote, 1);
    this.playing = true;
  }

  onMute() {
    if (this.playing) {
      this.output.stopNote(this.testNote, 1);
      this.playing = false;
    }
  }

  onChangeControl(controlIdx: number, value) {
    let control = this.ctx[controlIdx].key;
    this.controlParameters[controlIdx] = {
      index: controlIdx,
      parameterId: control,
      value:  parseInt(value.value, 10)};

      this.output.sendControlChange(control, value.value, 1);
  }

  updatePatchName(event: Event) {
    this.patchname = (event.target as HTMLInputElement).value;
  }

  onSelectPatchname(event: Event) {
    this.currentPatch = (event.target as HTMLSelectElement).value;
  }

  onLoadPatch() {
    if(!this.currentPatch) {
      return;
    }

    this.patchService.loadPatchFile(this.currentPatch).subscribe(patch => {
      for (let cp  of patch.data) {
        this.controlValues[cp.index] = cp.value;
        this.output.sendControlChange(cp.parameterId, cp.value, 1);
      }
    });
  }

  onSavePatch() {
    if (!this.patchname) {
      return;
    }

    let patch ={patchname: this.patchname, data: []};
    for (let parameter of Object.values(this.controlParameters)) {
      patch.data.push(parameter);
    }
    this.patchService.savePatchFile(patch);
  }
 }
