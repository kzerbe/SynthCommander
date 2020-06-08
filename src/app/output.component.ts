import {Component, Directive, HostListener, OnInit} from '@angular/core';

import {WebmidiService} from "./webmidi.service";
import {PatchfileService} from "./patchfile.service";
import {ICCGroupInterface, ICCMessageInterface, SynthmodelService} from "./synthmodel.service";

// update textContent of next sibling with range input value
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
    <div *ngIf="synthModel">
      <!-- test tone slider -->
      <h4>Tone selection</h4>
      <div class="row">
        <input type="range" class="col-9" min="46" max="92" [value]="testNote"
               (input)="onNoteChange($event)" slidermove>
        <span class="col-1">{{testNote}}</span>
        <button [disabled]="!playing" class="btn btn-primary col-2" (click)="onMute()">mute</button>
      </div>
      <hr/>
      <!-- storing and loading patches -->
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
            <option *ngFor="let patch of patchfiles" [value]="patch">{{patch}}</option>
          </select>
          <button class="btn btn-primary col-2" (click)="onloadPatch()">Load</button>
        </div>
      </div>
      <hr/>
      <!-- MIDI control change sliders -->
      <h4>Control Change</h4>
      <div *ngFor="let ccgroup of synthModel; let ccIdx1=index">
        <h5>{{synthModel[ccIdx1].name}}</h5>
        <div *ngFor="let ccAttr of synthModel[ccIdx1].ccm; let ccIdx2=index">
          <label for=cc{{ccIdx2}} class="col-2" >{{item(ccIdx1, ccIdx2).attr}}</label>
          <input type="range" id=rv{{idx2}} class="col-4" min="0" max="127"
                 [value]="item(ccIdx1, ccIdx2).value" (input)="onChangeControl(itemIndex(ccIdx1, ccIdx2), $event)" 
                 slidermove>
          <span [textContent]="item(ccIdx1, ccIdx2).value" class="col-1">0</span>
        </div>
      </div>
    </div>
  `,
  styles: ['text-right {justify-content: right}']
})
export class OutputComponent implements OnInit {
  synthModel: ICCGroupInterface[] = []; // current synth model
  ccAttr: any; // CC value mapping

  testNote = 46; // MIDI test note value
  playing = false; // test note playing ?

  patchfiles: string[] = []; // patch file names
  currentPatch = '';
  patchname = '';

  constructor(private midiService: WebmidiService, private patchService: PatchfileService,
              private synthmodelService: SynthmodelService) {
  }

  ngOnInit() {
    // subscribe patch name list
    this.patchService.getPatchfiles().subscribe(patchnames => {
      this.patchfiles = patchnames;
      if (this.patchfiles.length && !this.currentPatch) {
        this.currentPatch = this.patchfiles[0];
      }
    });

    // subscribe control change model & value mapping
    this.synthmodelService.model$.subscribe(model => this.synthModel = model);
    this.synthmodelService.controls$.subscribe(controls => this.ccAttr = controls);
  }

  // helper to get value mapping index
  itemIndex(groupIdx: number, attrIndex: number): number {
    return this.synthModel[groupIdx].ccm[attrIndex].itemId;
  }

  // helper to get mapped value holder
  item(groupIdx: number, attrIndex: number): ICCMessageInterface {
    return this.ccAttr[this.itemIndex(groupIdx, attrIndex)];
  }

  // test tone slider moved
  onNoteChange(event: Event) {
    if (this.playing) {
      this.midiService.stopNote(this.testNote);
    }

    this.testNote = parseInt((event.target as HTMLInputElement).value, 10);
    this.midiService.playNote(this.testNote);
    this.playing = true;
  }

  // mute button clicked
  onMute() {
    if (this.playing) {
      this.midiService.stopNote(this.testNote);
      this.playing = false;
    }
  }

  // control slider moved
  onChangeControl(controlIdx: number, event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    const ccm = this.ccAttr[controlIdx];
    ccm.value = value;
    this.midiService.setControl(ccm.key, ccm.value);
  }

  // patch name to store changed
  updatePatchName(event: Event) {
    this.patchname = (event.target as HTMLInputElement).value;
  }

  // patchname selection changed
  onSelectPatchname(event: Event) {
    this.currentPatch = (event.target as HTMLSelectElement).value;
  }

  // patch file selection committed
  onloadPatch() {
    if (!this.currentPatch) {
      return;
    }

    // read new patchfile
    this.patchService.loadPatchFile(this.currentPatch).subscribe(patch => {
      const count = Object.keys(this.ccAttr).length;
      // reset value holders
      for (let paramIdx = 0; paramIdx < count; ++paramIdx) {
        this.ccAttr[paramIdx].value = 0;
        this.midiService.setControl(this.ccAttr[paramIdx].key, 0);
      }
      // set loaded control values to UI and MIDI
      for (let cp of patch.data) {
        this.ccAttr[cp.itemId] = cp;
        this.midiService.setControl(cp.key, cp.value);
      }
    });
  }

  // save current configuration to patch file
  onSavePatch() {
    if (!this.patchname) {
      return;
    }

    let patch = {patchname: this.patchname, data: []};
    for (let attr of Object.values(this.ccAttr)) {
       const att = attr as ICCMessageInterface;
      if(att.value) {
        patch.data.push(att);
      }
    }
    this.patchService.savePatchFile(patch);
    this.patchfiles.push(this.patchname);
  }
}
