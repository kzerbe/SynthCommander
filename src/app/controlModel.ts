enum Module {
  EG = "Envelope Generator",
  TREM = "Tremollo",
  LFO = "Oscillator LFO",
  MOD = "Modulator",
  DELAY = "Delay",
  REVERB = "Reverb",
  FILTER = "Filter",
  SWEEP = "Filter Sweep",
  OSC = "Oscillator",
  ARP = "Arpeggio"
}

class ControlMessage {
  mod: Module;
  attr: string;
  key: number;
  value: number;
  min?: number;
  max?: number;
}

const controls: ControlMessage[] = [
  {mod: Module.EG, attr: 'type', key: 14, value: 0},
  {mod: Module.EG, attr: 'attack', key: 16, value: 0},
  {mod: Module.EG, attr: 'release', key: 19, value: 0},
  {mod: Module.TREM, attr: 'depth', key: 20, value: 0},
  {mod: Module.TREM, attr: 'rate', key: 21, value: 0},
  {mod: Module.LFO, attr: 'rate', key: 24, value: 0},
  {mod: Module.LFO, attr: 'depth', key: 26, value: 0},
  {mod: Module.MOD, attr: 'time', key: 28, value: 0},
  {mod: Module.MOD, attr: 'depth', key: 29, value: 0},
  {mod: Module.DELAY, attr: 'time', key: 30, value: 0},
  {mod: Module.DELAY, attr: 'depth', key: 31, value: 0},
  {mod: Module.DELAY, attr: 'mix', key: 33, value: 0},
  {mod: Module.REVERB, attr: 'time', key: 34, value: 0},
  {mod: Module.REVERB, attr: 'depth', key: 35, value: 0},
  {mod: Module.REVERB, attr: 'mix', key: 36, value: 0},
  {mod: Module.FILTER, attr: 'type', key: 42, value: 0},
  {mod: Module.FILTER, attr: 'cutoff', key: 43, value: 0},
  {mod: Module.FILTER, attr: 'resonance', key: 44, value: 0},
  {mod: Module.SWEEP, attr: 'depth', key: 45, value: 0},
  {mod: Module.SWEEP, attr: 'rate', key: 46, value: 0},
  {mod: Module.OSC, attr: 'type', key: 53, value: 0},
  {mod: Module.OSC, attr: 'shape', key: 54, value: 0},
  {mod: Module.OSC, attr: 'alt', key: 55, value: 0},
  {mod: Module.MOD, attr: 'type', key: 88, value: 0},
  {mod: Module.DELAY, attr: 'type', key: 89, value: 0},
  {mod: Module.REVERB, attr: 'type', key: 90, value: 0},
  {mod: Module.ARP, attr: 'pattern', key: 117, value: 0},
  {mod: Module.ARP, attr: 'intervals', key: 118, value: 0},
  {mod: Module.ARP, attr: 'length', key: 119, value: 0},
];

export {ControlMessage, Module, controls};
