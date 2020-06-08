# SynthCommander

  * SynthCommander is a WebMidi tool that allows to configure synthesizers via control change messages (CC).
  * SynthCommander can use synthesizer definition files (JSON or YAML) to create individual user interfaces for any synthesizer model
  * SynthCommander stores, lists and loads patches containing built from control changes
  * SynthCommander can monitor device control changes notified via MIDI input

SynthCommander consist of a small application server (stored in path "server") as backend and an Angular single page application as frontend

SETUP:
 1. run "npm install" in main folder
 2. run "npm build" in main folder
 3. run "cp -r dist/* server/public"
 4. run "cd server"
 5. run "npm install"
 6. run "npm start"
 7. open browser on "http://localhost:8008"
 
 For deployment just copy the "server" folder to any target server that has nodejs v10 or newer installed.
 
  * An Angular tutorial based on SynthCommander sources in German language is available at https://dokuwiki.zerbe.cloud
  * An instance of SynthCommander is running on https://synthcommander.zerbe.cloud

This project was generated with [Angular CLI](https://github.com/angular/angular-cli) version 7.3.0.

## Development server

Run `ng serve` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Code scaffolding

Run `ng generate component component-name` to generate a new component. You can also use `ng generate directive|pipe|service|class|guard|interface|enum|module`.

## Build

Run `ng build` to build the project. The build artifacts will be stored in the `dist/` directory. Use the `--prod` flag for a production build.
