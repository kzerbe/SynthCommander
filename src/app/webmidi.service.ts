import {Injectable} from "@angular/core";
import WebMidi, {Input, Output} from 'webmidi';
import {BehaviorSubject} from "rxjs";

const noOutputErr = 'please select device first';

// data of MIDI input change
export class ControlChangeMessage {
  control: number;
  value: number;
}

@Injectable({
  providedIn: 'root'
})
export class WebmidiService {
  error$ = new BehaviorSubject<string>('');       // error stream
  inputs$ = new BehaviorSubject<Input[]>(null);   // MIDI inputs
  outputs$ = new BehaviorSubject<Output[]>(null); // MIDI outputs

  // MIDI input change stream
  controlChanges$ = new BehaviorSubject<ControlChangeMessage>(null);

  input: Input = null;      // selected  MIDI input device
  output: Output = null;    // selected  MIDI output device

  constructor() {
    // connect to WebMidi API
    WebMidi.enable(err => {
      let msg: string;
      if (err) {
        msg = err.message; // no midi available error
      } else if (!WebMidi.outputs.length) {
        msg = 'no MIDI out devices attached.';
      } else {
        // notify subscribers
        this.inputs$.next(WebMidi.inputs);
        this.outputs$.next(WebMidi.outputs);
        if(WebMidi.outputs.length == 1) {
          this.setOutput(0); // set default output device
        }
        this.handleEvents(); // monitor MIDI input
        msg = ''; // no error
      }
      this.error$.next(msg); // notify error
    })
  }

  // select input device via input$ index
  setInput(index: number) {
    this.inputs$.subscribe(inputs => {
      this.input = inputs[index];
      this.handleEvents();
    });
  }

  // select output device via output$ index
  setOutput(index: number) {
    this.outputs$.subscribe(outputs => {
      this.output = outputs[index];
    });
  }

  // set CC with MIDI number key to value
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

  // play test node MIDI note number note
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

  // mute note
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

  // monitor MIDI input for control changes
  private handleEvents() {
    if (!this.input) {
      this.error$.next(noOutputErr);
      return
    }
    this.input.addListener('controlchange', 1, (e) => {
      let control = e.controller.number;
      let value = e.value;

      // notify subscribers
      this.controlChanges$.next({control: control, value: value});
    });
  }
}
