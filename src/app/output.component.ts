import {Component, Directive, HostListener, OnInit} from '@angular/core';

import {Output} from "webmidi";
import {WebmidiService} from "./webmidi.service";
import {PatchfileService} from "./patchfile.service";
import {ICCGroupInterface, ICCMessageInterface, SynthmodelService} from "./synthmodel.service";


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
    <hr/>
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
    <h4>Control Change</h4>
    <div *ngFor="let ccgroup of synthModel; let ccIdx1=index">
      <h5>{{synthModel[ccIdx1].name}}</h5>
      <div *ngFor="let ccAttr of synthModel[ccIdx1].ccm; let ccIdx2=index">
        <label for=cc{{ccIdx2}} class="col-2" >{{item(ccIdx1, ccIdx2).attr}}</label>
        <input type="range" id=rv{{idx2}} class="col-4" min="0" max="127"
               [value]="item(ccIdx1, ccIdx2).value" (input)="onChangeControl2(itemIndex(ccIdx1, ccIdx2), $event)" slidermove>
        <span [textContent]="item(ccIdx1, ccIdx2).value" class="col-1">0</span>
      </div>
    </div>
  `,
  styles: ['text-right {justify-content: right}']
})
export class OutputComponent implements OnInit {
  synthModel: ICCGroupInterface[] = [];
  ccAttr: any;

  output: Output;
  error = '';
  testNote = 46;
  playing = false;
  patchfiles: string[] = [];
  currentPatch = '';
  patchname = '';

  constructor(private midiService: WebmidiService, private patchService: PatchfileService,
              private synthmodelService: SynthmodelService) {
  }

  ngOnInit() {
    this.patchService.getPatchfiles().subscribe(patchnames => {
      this.patchfiles = patchnames;
      if (this.patchfiles.length && !this.currentPatch) {
        this.currentPatch = this.patchfiles[0];
      }
    });

    this.midiService.currentOutput.subscribe(output => {
      this.output = output;
      if (!this.output) {
        return;
      }

      this.synthmodelService.loadModelFile('nts-1').subscribe(model => {
        this.synthModel = model;
        let itemId = 0;
        this.ccAttr = {};
        for (let group of this.synthModel) {
          for (let attr of group.ccm) {
            this.ccAttr[itemId] = attr;
            attr.itemId = itemId++;
          }
        }
      });
    });
  }

  itemIndex(groupIdx: number, attrIndex: number): number {
    return this.synthModel[groupIdx].ccm[attrIndex].itemId;
  }

  item(groupIdx: number, attrIndex: number): ICCMessageInterface {
    return this.ccAttr[this.itemIndex(groupIdx, attrIndex)];
  }

  onNoteChange(event: Event) {
    if (this.playing && this.output) {
      this.output.stopNote(this.testNote, 1);
    }

    if (this.output) {
      this.testNote = parseInt((event.target as HTMLInputElement).value, 10);
      this.output.playNote(this.testNote, 1);
      this.playing = true;
    }
  }

  onMute() {
    if (this.playing && this.output) {
      this.output.stopNote(this.testNote, 1);
      this.playing = false;
    }
  }

  onChangeControl2(controlIdx: number, event: Event) {
    const value = parseInt((event.target as HTMLInputElement).value, 10);
    const ccm = this.ccAttr[controlIdx];
    ccm.value = value;
    if (this.output) {
      this.output.sendControlChange(ccm.key, ccm.value, 1);
    }
  }

  updatePatchName(event: Event) {
    this.patchname = (event.target as HTMLInputElement).value;
  }

  onSelectPatchname(event: Event) {
    this.currentPatch = (event.target as HTMLSelectElement).value;
  }

  onloadPatch() {
    if (!this.currentPatch) {
      return;
    }
    const output = this.output;

    this.patchService.loadPatchFile(this.currentPatch).subscribe(patch => {
      const count = Object.keys(this.ccAttr).length;
      for (let paramIdx = 0; paramIdx < count; ++paramIdx) {
        this.ccAttr[paramIdx].value = 0;
        if (output) {
          output.sendControlChange(this.ccAttr[paramIdx].key, 0, 1);
        }
      }

      for (let cp of patch.data) {
        this.ccAttr[cp.itemId] = cp;
        if (output) {
          output.sendControlChange(cp.key, cp.value, 1);
        }
      }
    });
  }

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
