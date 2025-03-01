import GeoJSON from "ol/format/GeoJSON";
import { get } from "svelte/store";
import { GEO_TYPES, TOOLS } from "./constants";
import { crsToProj } from "./layers";
import { changesGeo, changesProps, featureJson, tool } from "./store";

export const buildEditables = (
  schema,
  props,
  changes = {},
  depth = 1,
  prefix = ""
) => {
  return Object.keys(schema).flatMap((name) => {
    if (schema[name].type === "object") {
      return [
        {
          name: prefix + name,
          label: schema[name].title || name,
          isValue: false,
          depth: depth,
        },
      ].concat(
        buildEditables(
          schema[name].properties,
          props[name] || {},
          changes,
          depth + 1,
          prefix + name + "."
        )
      );
    }
    return {
      name: prefix + name,
      label: schema[name].title || name,
      value: changes[prefix + name] || props[name] || "",
      isDirty: changes[prefix + name] && changes[prefix + name] !== props[name],
      isValue: true,
      depth: depth,
    };
  });
};

export const resolveLocalRefs = (schema, defs) => {
  const s = { ...schema };

  if (s.properties) {
    const props = s.properties;

    Object.keys(props).forEach((key) => {
      if (props[key]["$ref"] && props[key]["$ref"].includes("$defs")) {
        props[key] = defs[props[key]["$ref"].substr(8)];
      }
      if (props[key].type === "object") {
        props[key] = resolveLocalRefs(props[key], defs);
      }
      //TODO: array support
      if (props[key].type === "array") {
        delete props[key];
      }
    });
  }

  return s;
};

export const findGeoType = (schema, defs) => {
  //const s = resolveLocalRefs(schema, defs);

  const types = [];

  //TODO: iterate over all properties, other types
  if (schema && schema["x-ogc-role"] === "primary-geometry") {
    if (schema.format === "geometry-point") {
      types.push(GEO_TYPES.POINT);
    }
  }

  /*if (s.properties) {
    if (s.properties.type && s.properties.type.enum) {
      types.push(...s.properties.type.enum);
    }
  }
  if (s.oneOf) {
    s.oneOf.forEach((o) => {
      if (o.type === "object") {
        types.push(...findGeoType(o, defs));
      }
    });
  }*/

  return types;
};

export const geoJson = (projection, crs) =>
  new GeoJSON({
    featureProjection: projection,
    dataProjection: crsToProj(crs),
  });

export const buildFeature = (projection, crs, patch) => {
  const feature =
    get(tool) === TOOLS.CREATE
      ? //TODO: add crs
        { type: "Feature", properties: {} }
      : patch
      ? { id: get(featureJson).id, properties: {} }
      : get(featureJson);

  if (get(changesGeo)) {
    const geoJson = new GeoJSON({
      featureProjection: projection,
      dataProjection: crsToProj(crs),
    });
    feature.geometry = geoJson.writeGeometryObject(get(changesGeo), {
      rightHanded: true,
      //TODO: configurable?
      decimals: 10,
      featureProjection: projection,
      dataProjection: projection,
    });
  }
  if (get(changesProps)) {
    const changes = get(changesProps);
    const newProps = {
      ...feature.properties,
    };

    Object.keys(changes).forEach((key) => {
      const path = key.split(".");
      let obj = newProps;
      for (let i = 0; i < path.length - 1; i++) {
        if (!obj[path[i]]) {
          obj[path[i]] = {};
        }
        obj = obj[path[i]];
      }
      obj[path[path.length - 1]] = changes[key];
    });

    feature.properties = newProps;
  }

  return feature;
};
