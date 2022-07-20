import { Map } from "ol";
import { draws, modify, select, snap } from "./interactions";
import { editLayer, ogcApiLayer } from "./layers";
import { editorStyles } from "./styles";
import Tools from "./Tools";
import Panel from "./Panel";

import "./tailwind.css";
import { deleteItem, getItem, getSchema, postItem, putItem } from "./api";
import { buildFeature, findGeoType, geoJson, resolveLocalRefs } from "./schema";
import {
  changesGeo,
  changesProps,
  collection,
  collections,
  featureEtag,
  featureJson,
  geo,
  hasChanges,
  restoreFeatureOl,
  sync,
  tool,
} from "./store";
import { get } from "svelte/store";
import { GEO_TYPES, STATES, TOOLS } from "./constants";

const sleepAsync = (ms = 1000) =>
  new Promise((resolve) => setTimeout(resolve, ms));

export default class OgcApiEditor {
  constructor({ api = {}, tools = {}, dryRun = false } = {}) {
    this.api = {
      crs: "http://www.opengis.net/def/crs/OGC/1.3/CRS84",
      styleFunction: undefined,
      ...api,
      schemas: {
        custom: null,
        create: "schema?type=create",
        replace: "schema?type=replace",
        update: "schema?type=update",
        ...(api.schemas || {}),
      },
      capabilities: {
        crs: false,
        patch: false,
        maxAllowableOffset: false,
        ...(api.capabilities || {}),
      },
    };

    this.tools = {
      create: true,
      edit: true,
      delete: true,
      initial: "CREATE", //TODO: constants? how to export? or objects per tool?
      position: {
        top: "5rem",
        left: "0.5rem",
      },
      styleFunction: undefined,
      styleOptions: {
        color: "red",
        strokeWidth: 2,
        circleRadius: 5,
        fillOpacity: "",
      },
      ...tools,
    };

    if (!this.tools.styleFunction) {
      this.tools.styleFunction = editorStyles(this.tools.styleOptions);
    }

    this.dryRun = dryRun;
  }

  /**
   * @param {Map} map
   */
  addToMap(map) {
    const { url, collections: c, crs, styleFunction } = this.api;
    const coll = c[0];
    const colls = {
      [coll]: {
        id: coll,
        crs,
      },
    };

    collection.set(coll);

    const schemas = Object.values(colls).map((collection) =>
      getSchema(url, collection.id).then((schema) => {
        console.log(schema);
        const s = resolveLocalRefs(
          schema.properties.properties,
          schema["$defs"]
        );
        console.log(s);

        let geoTypes = findGeoType(schema.properties.geometry, schema["$defs"]);
        if (geoTypes.includes(GEO_TYPES.MULTI_POINT))
          geoTypes.splice(
            geoTypes.indexOf(GEO_TYPES.MULTI_POINT),
            1,
            GEO_TYPES.POINT
          );
        if (geoTypes.includes(GEO_TYPES.MULTI_LINE_STRING))
          geoTypes.splice(
            geoTypes.indexOf(GEO_TYPES.MULTI_LINE_STRING),
            1,
            GEO_TYPES.LINE_STRING
          );
        if (geoTypes.includes(GEO_TYPES.MULTI_POLYGON))
          geoTypes.splice(
            geoTypes.indexOf(GEO_TYPES.MULTI_POLYGON),
            1,
            GEO_TYPES.POLYGON
          );
        geoTypes = [...new Set(geoTypes)];

        console.log(geoTypes);

        if (geoTypes.length > 0) {
          geo.update((prev) => prev || geoTypes[0]);
        }

        collections.update((prev) => ({
          ...prev,
          [collection.id]: {
            ...collection,
            label: schema.title,
            properties: s.properties,
            geoTypes,
          },
        }));
      })
    );
    Promise.all(schemas).then((all) => console.log("INITIALIZED", all));

    const items = (this.items = ogcApiLayer(
      url,
      coll,
      1000,
      crs,
      styleFunction
    ));
    const workbench = editLayer(
      crs,
      this.tools.styleFunction,
      map.getView().getProjection()
    );

    map.addControl(new Tools(this.tools));
    map.addControl(
      new Panel({
        map,
        allowDelete: this.tools.delete,
        onSaveAsync: () => {
          const f = buildFeature(map.getView().getProjection(), crs);
          return this._syncChanges(f);
        },
        onDeleteAsync: this._deleteFeature.bind(this),
      })
    );

    map.addInteraction(snap(workbench.getSource()));
    if (this.tools.create) {
      map.getInteractions().extend(draws(workbench.getSource(), colls[coll]));
    }
    if (this.tools.edit) {
      map.addInteraction(modify(workbench.getSource()));
      map.addInteraction(select(url, colls, items.getSource()));
    }

    map.addLayer(items);
    map.addLayer(workbench);

    this.geoJson = geoJson(map.getView().getProjection(), crs);
  }

  _syncChanges(feature) {
    console.log("_syncChanges");
    if (get(hasChanges)) {
      //const feature = buildFeature();

      const coll = get(collections)[get(collection)];

      if (get(tool) === TOOLS.CREATE) {
        if (this.dryRun) {
          console.log("POST", coll.id, feature);
          return sleepAsync();
        }

        return postItem(this.api.url, coll.id, feature, this.api.crs).then(
          (id) => {
            console.log("id", id);
            const f = this.geoJson.readFeature({ ...feature, id });
            this.items.getSource().addFeature(f);
          }
        );
      }

      if (this.dryRun) {
        console.log("PUT", coll.id, feature.id, feature);
        return sleepAsync();
      }

      return putItem(
        this.api.url,
        coll.id,
        feature,
        this.api.crs,
        get(featureEtag)
      )
        .then(() => {
          const f = this.geoJson.readFeature(feature);
          this.items.getSource().addFeature(f);
        })
        .catch((error) => {
          if (error.message.indexOf("412") === 0) {
            const discardChanges = () => {
              changesGeo.set(undefined);
              changesProps.set(undefined);
            };

            return getItem(this.api.url, coll.id, feature.id, coll.crs).then(
              (json) => {
                featureJson.set(json.feature);
                featureEtag.set(json.etag);
                sync.set(STATES.CONFLICT);
                return discardChanges;
              }
            );
          } else {
            throw error;
          }
        });
    }

    return Promise.resolve();
  }

  _deleteFeature() {
    if (get(featureJson)) {
      restoreFeatureOl.set(undefined);

      if (this.dryRun) {
        console.log("DELETE", get(collection), get(featureJson).id);
        return sleepAsync();
      }

      return deleteItem(
        this.api.url,
        get(collection),
        get(featureJson).id
      ).then(() => {});
    }
  }
}
