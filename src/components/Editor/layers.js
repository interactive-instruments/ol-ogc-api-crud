import VectorSource from "ol/source/Vector";
import VectorLayer from "ol/layer/Vector";
import GeoJSON from "ol/format/GeoJSON";
import Projection from "ol/proj/Projection";
import { tile } from "ol/loadingstrategy";
import { createXYZ } from "ol/tilegrid";
import { featureJson, panelOff, sync } from "./store";

export const ogcApiLayer = (url, collection, limit, crs, styleFunction) => {
  const vectorSource = new VectorSource({
    format: new GeoJSON({
      dataProjection: crsToProj(crs),
    }),
    loader: function (extent, resolution, projection, onSuccess, onError) {
      //TODO: maxAllowableOffset
      //TODO: use getItems
      const query =
        `${url}/collections/${collection}/items` +
        `?f=json&limit=${limit}&` +
        "bbox=" +
        extent[0] +
        "," +
        extent[1] +
        "," +
        extent[2] +
        "," +
        extent[3] +
        "&bbox-crs=" +
        encodeURIComponent(projToCrs(projection)) +
        "&crs=" +
        encodeURIComponent(crs);

      fetch(query).then((response) => {
        return response.ok
          ? response.json().then((json) => {
              var features = vectorSource
                .getFormat()
                .readFeatures(json, { featureProjection: projection });
              vectorSource.addFeatures(features);
              onSuccess(features);
            })
          : response
              .text()
              .then((text) =>
                onError(`${response.status} ${response.statusText} - ${text}`)
              );
      });
    },
    strategy: tile(
      createXYZ({
        tileSize: 512,
      })
    ),
  });

  const vectorLayer = new VectorLayer({
    source: vectorSource,
    properties: { collection },
    style: styleFunction,
  });

  return vectorLayer;
};

export const editLayer = (crs, style, projection) => {
  const geoJson = new GeoJSON({
    dataProjection: crsToProj(crs),
  });

  const source = new VectorSource({});

  featureJson.subscribe((next) => {
    if (next) {
      const f = geoJson.readFeature(next, {
        featureProjection: projection,
      });
      source.addFeature(f);
    } else {
      source.clear();
    }
  });

  panelOff.subscribe((off) => {
    if (off) {
      source.clear();
    }
  });

  return new VectorLayer({
    source,
    style,
  });
};

export const projToCrs = (proj) =>
  proj.getCode().replace("EPSG:", "http://www.opengis.net/def/crs/EPSG/0/");

export const crsToProj = (crs) => {
  if (crs === "http://www.opengis.net/def/crs/OGC/1.3/CRS84") {
    return new Projection({
      code: "EPSG:4326",
      axisOrientation: "neu",
    });
  }

  /*if (crs === "http://www.opengis.net/def/crs/EPSG/0/25832") {
    return "EPSG:25832"
  }*/

  return new Projection({
    code: crs.replace("http://www.opengis.net/def/crs/EPSG/0/", "EPSG:"),
  });
};
