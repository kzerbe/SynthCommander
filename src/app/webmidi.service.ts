import {Injectable} from "@angular/core";
import WebMidi, {Input, Output} from 'webmidi';
import {BehaviorSubject} from "rxjs";

export class ControlChangeMessage {
  control: number;
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebmidiService {
  error = new BehaviorSubject<string>('');
  inputs = new BehaviorSubject<Input[]>(null);
  outputs = new BehaviorSubject<Output[]>(null);
  currentInput = new BehaviorSubject<Input>(null);
  currentOutput = new BehaviorSubject<Output|null>(null);
  controlChanges = new BehaviorSubject<ControlChangeMessage>(null);

  constructor() {
    WebMidi.enable(err => {
      let msg = '';
      if (err) {
        msg = err.message;
      } else if (WebMidi.outputs.length < 1) {
        msg = 'no MIDI out devices attached.';
      } else {
        this.inputs.next(WebMidi.inputs);
        this.outputs.next(WebMidi.outputs);
        if(WebMidi.outputs.length == 1) {
          this.setOutput(0);
        }
        this.handleEvents();
      }
      this.error.next(msg);
    })
  }

  setInput(index: number) {
    this.inputs.subscribe(inputs => {
      this.currentInput.next(inputs[index]);
    });
  }

  setOutput(index: number) {
    this.outputs.subscribe(outputs => {
      this.currentOutput.next(outputs[index]);
    });
  }

  handleEvents() {
    this.currentInput.subscribe(input => {
      if (!input) {
        return;
      }
      input.addListener('controlchange', 1, (e) => {
        let control = e.controller.number;
        let value = e.value;
        this.controlChanges.next({control: control, value: value});
      });
    })
  }
}
