# StarWars

This is a simple angular app that displaying aliens on a map when user click on it and shows the distance from each alien from the user.

You can check the deployed version at https://denspiro.github.io/rebels/

# Working with project locally

All changes should be done in a `gh-pages` branch and then merged into master.

After the changes you should build the project locally and commit everything to keep deployed version functional and up to date.

TODO: Setup proper pipeline for automatic builds.

## Install

Clone the repo and install all dependencies ny running `yarn`.

## Development server

Run `yarn start --watch` for a dev server. Navigate to `http://localhost:4200/`. The app will automatically reload if you change any of the source files.

## Build

Switch to `gh-pages` brunch and run `yarn build --output-path docs --base-href /rebels/` to build the project. The build artifacts will be stored in the `docs/` directory.
