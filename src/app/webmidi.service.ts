import {Injectable} from "@angular/core";
import WebMidi, {Input, Output} from 'webmidi';
import {BehaviorSubject} from "rxjs";

const noOutputErr = 'please select device first';

export class ControlChangeMessage {
  control: number;
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebmidiService {
  error$ = new BehaviorSubject<string>('');
  inputs$ = new BehaviorSubject<Input[]>(null);
  outputs$ = new BehaviorSubject<Output[]>(null);
  controlChanges$ = new BehaviorSubject<ControlChangeMessage>(null);
  input: Input = null;
  output: Output = null;

  constructor() {
    WebMidi.enable(err => {
      let msg = '';
      if (err) {
        msg = err.message;
      } else if (WebMidi.outputs.length < 1) {
        msg = 'no MIDI out devices attached.';
      } else {
        this.inputs$.next(WebMidi.inputs);
        this.outputs$.next(WebMidi.outputs);
        if(WebMidi.outputs.length == 1) {
          this.setOutput(0);
        }
        this.handleEvents();
      }
      this.error$.next(msg);
    })
  }

  setInput(index: number) {
    this.inputs$.subscribe(inputs$ => {
      this.input = inputs$[index];
      this.handleEvents();
    });
  }

  setOutput(index: number) {
    this.outputs$.subscribe(outputs$ => {
      this.output = outputs$[index];
    });
  }

  setControl(key: number, value: number) {
    if (!this.output) {
      this.error$.next(noOutputErr);
      return
    }
    try {
      this.output.sendControlChange(key, value, 1);
    } catch (e) {
      this.error$.next(e.message);
    }
  }

  playNote(note: number) {
    if (!this.output) {
      this.error$.next(noOutputErr);
      return
    }
    try {
      this.output.playNote(note, 1);
    } catch(e) {
      this.error$.next(e.message);
    }
  }

  stopNote(note: number) {
    if (!this.output) {
      this.error$.next(noOutputErr);
      return
    }
    try {
      this.output.stopNote(note, 1);
    } catch(e) {
      this.error$.next(e.message);
    }
  }

  handleEvents() {
    if (!this.input) {
      this.error$.next(noOutputErr);
      return
    }
    this.input.addListener('controlchange', 1, (e) => {
      let control = e.controller.number;
      let value = e.value;
      this.controlChanges$.next({control: control, value: value});
    });
  }
}
