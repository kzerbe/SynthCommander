import {ChangeDetectorRef, Component, DoCheck, OnInit} from "@angular/core";

import {controls} from "./controlModel";
import {WebmidiService} from "./webmidi.service";

@Component({
  selector: 'app-input',
  template: `
    <div>
      <br>
      <h3>MIDI Input Monitor</h3>
      <br>
      <h4>Control Change Messages</h4>
      <table class="table">
        <thead class="table-dark">
        <tr>
          <th scope="col">Id</th>
          <th scope="col">Module</th>
          <th scope="col">Parameter</th>
          <th scope="col">Value</th>
        </tr>
        </thead>
        <tbody>
        <tr *ngFor="let control of ctx; let idx=index">
          <td>{{control.key}}</td>
          <td>{{control.mod}}</td>
          <td>{{control.attr}}</td>
          <td>
            <span [textContent]="[controlValues[idx]]"></span>
          </td>
        </tr>
        </tbody>
      </table>
    </div>
  `,
  styles: []
})
export class InputComponent implements OnInit, DoCheck {
  ctx = controls;
  controlValues: number[] = [];

  constructor(private midiService: WebmidiService, private cdr: ChangeDetectorRef) {
  }

  ngOnInit() {
    for (let c in controls) {
      this.controlValues.push(0);
    }

    this.midiService.controlChanges.subscribe(chg => {
      if (!chg) {
        return;
      }

      let idx = controls.findIndex(ctl => {
        return ctl.key === chg.control;
      });

      if (idx !== -1) {
        let newValues = this.controlValues;
        newValues[idx] = chg.value;
        this.controlValues = newValues;
        this.cdr.detectChanges();
      }
    });
  }

  ngDoCheck() {
    this.cdr.detectChanges();
  }
}
