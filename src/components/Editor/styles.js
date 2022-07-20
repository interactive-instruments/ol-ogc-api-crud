import { Style, Stroke, Circle, Fill } from "ol/style";
import { MultiPoint } from "ol/geom";

export const editorStyles = ({
  color,
  strokeWidth,
  circleRadius,
  fillOpacity,
}) => {
  const styles = {
    Point: new Style({
      image: new Circle({
        radius: circleRadius,
        fill: new Fill({
          color,
        }),
      }),
    }),
    LineString: [
      new Style({
        stroke: new Stroke({
          color,
          width: strokeWidth,
        }),
      }),
      new Style({
        image: new Circle({
          radius: circleRadius,
          fill: new Fill({
            color,
          }),
        }),
        geometry: function (feature) {
          // return the coordinates of the first ring of each polygon
          const coordinates = feature.getGeometry().getCoordinates();
          return new MultiPoint(coordinates);
        },
      }),
    ],
    MultiLineString: new Style({
      stroke: new Stroke({
        color,
        width: strokeWidth,
      }),
    }),
    MultiPoint: [
      new Style({
        image: new Circle({
          radius: circleRadius,
          fill: new Fill({
            color,
          }),
        }),
      }),
      new Style({
        image: new Circle({
          radius: circleRadius,
          fill: new Fill({
            color,
          }),
        }),
        geometry: function (feature) {
          // return the coordinates of the first ring of each polygon
          const coordinates = feature
            .getGeometry()
            .getCoordinates()
            .reduce((prev, curr) => prev.concat(curr), []);
          return new MultiPoint(coordinates);
        },
      }),
    ],
    MultiPolygon: [
      new Style({
        stroke: new Stroke({
          color,
          //lineDash: [5],
          width: strokeWidth,
        }),
        fill: new Fill({
          color: "rgba(255, 0, 0, 0.5)",
        }),
      }),
      new Style({
        image: new Circle({
          radius: circleRadius,
          fill: new Fill({
            color,
          }),
        }),
        geometry: function (feature) {
          // return the coordinates of the first ring of each polygon
          const coordinates = feature
            .getGeometry()
            .getCoordinates()
            .reduce((prev, curr) => prev.concat(curr[0]), []);
          return new MultiPoint(coordinates);
        },
      }),
    ],
    Polygon: [
      new Style({
        stroke: new Stroke({
          color,
          //lineDash: [5],
          width: strokeWidth,
        }),
        fill: new Fill({
          color: "rgba(255, 0, 0, 0.5)",
        }),
      }),
      new Style({
        image: new Circle({
          radius: circleRadius,
          fill: new Fill({
            color,
          }),
        }),
        geometry: function (feature) {
          // return the coordinates of the first ring of each polygon
          const coordinates = feature
            .getGeometry()
            .getCoordinates()
            .reduce((prev, curr) => prev.concat(curr), []);
          return new MultiPoint(coordinates);
        },
      }),
    ],
  };

  return (feature) => {
    return styles[feature.getGeometry().getType()];
  };
};
