# OGC API Editor for OpenLayers

An OpenLayers feature editor for OGC APIs that implement the CRUD draft ([OGC API - Features - Part 4: Create, Replace, Update and Delete](http://docs.ogc.org/DRAFTS/20-002.html)). 

This extension adds a layer with the GeoJSON features and tools to edit existing feature geometries and properties as well as create new features.

## Examples

Theses examples demonstrate usage. They use the `dryRun` option, so your changes are not persisted and will disappear on reload.

- [Basic usage](http://raw.githack.com/interactive-instruments/ol-ogc-api-crud/main/examples/basic.html)<br/>
  Create an editor for [demo.ldproxy.net/vineyards](https://demo.ldproxy.net/vineyards).

## Installation

### Browser

#### JS

```HTML
<script src="https://unpkg.com/ol-ogc-api-crud@0.1.0"></script>
```

#### CSS

```HTML
<link rel="stylesheet" href="https://unpkg.com/ol-ogc-api-crud@0.1.0/dist/style.css" />
```

### npm

NPM package: [ol-ogc-api-crud](https://www.npmjs.com/package/ol-ogc-api-crud).

#### JS

Install the package via `npm`

    npm install ol-ogc-api-crud --save

#### CSS

The CSS file `style.css` can be found in `./node_modules/ol-ogc-api-crud/dist`

## Options

These are the options with their default values. 

```js
const editor = new OgcApiEditor({
  api: {
    url: undefined, // landing page of the api, required
    collections: [], // collections that should be available in the editor, currently only the first one is used
    crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84", // CRS that is used to read and write geometries, changing it only makes sense when the API supports [OGC API - Features - Part 2: Coordinate Reference Systems by Reference](https://docs.opengeospatial.org/is/18-058/18-058.html)
    styleFunction: undefined, // optional style for the GeoJSON layer
  },
  tools: {
    create: true, // enable creation of new features
    edit: true, // enable editing of existing features
    delete: true, // enable deletion of existing features
    position: {
      // position of the control button group
      top: "5rem",
      left: "0.5rem",
    },
    styleFunction: undefined, // optional style for the editor layer
    styleOptions: {
      // options of the default style for the editor layer, only used when styleFunction is not set
      color: "red",
      strokeWidth: 2,
      circleRadius: 5,
    },
  },
  dryRun: false, // if true the editor will not send any POST/PUT/DELETE requests to the API, they will be logged to the javascript console instead
});
```
