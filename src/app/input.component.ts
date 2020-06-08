import {ChangeDetectorRef, Component, DoCheck, OnInit} from "@angular/core";

import {WebmidiService} from "./webmidi.service";
import {ICCGroupInterface, ICCMessageInterface, SynthmodelService} from "./synthmodel.service";

@Component({
  selector: 'app-input',
  template: `
    <div>
      <hr>
      <div *ngIf="synthModel">
        <h3>MIDI Input Monitor</h3>
        <br>
        <h4>Control Change Messages</h4>
      </div>
      <!-- display grouped midi control changes -->
      <div class="list-group d-flex flex-row">
        <div *ngFor="let ccgroup of synthModel; let ccIdx1=index" class="p-2">
          <h5>{{synthModel[ccIdx1].name}}</h5>
          <div *ngFor="let ccAttr of synthModel[ccIdx1].ccm; let ccIdx2=index">
            <span>{{item(ccIdx1, ccIdx2).attr}}</span>&nbsp;
            <span>{{item(ccIdx1, ccIdx2).value}}</span>
          </div>
        </div>
      </div>
    </div>
  `,
  styles: []
})
export class InputComponent implements OnInit, DoCheck {
  synthModel: ICCGroupInterface[] = []; // current synth model
  ccAttr: any = [];  // control change value mapping

  constructor(private midiService: WebmidiService, private synthmodelService: SynthmodelService,
              private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    // subscribe for MIDI input control changes
    this.midiService.controlChanges$.subscribe(chg => {
      if (!chg) {
        return;
      }

      // update UI with control changes
      for (let group of this.synthModel) {
        for (let attr of group.ccm) {
          if (attr.key === chg.control) {
            this.ccAttr[attr.itemId].value = chg.value
            this.cdr.detectChanges();
          }
        }
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

  // forced change detection
  ngDoCheck() {
    this.cdr.detectChanges();
  }
}
