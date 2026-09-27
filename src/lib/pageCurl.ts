/**
 * Page-curl geometry ported from flipbook-vue (MIT, © Takeshi Sone).
 * https://github.com/ts1/flipbook-vue
 *
 * The flipping page is split into vertical strips that are rolled around a
 * cylinder of radius pageWidth / theta, each strip carrying its own slice of
 * the page image plus a shading gradient, which is what makes the page look
 * like it is being peeled rather than simply rotated.
 */
import {
  identity,
  multiply,
  perspective,
  rotateY,
  toString as matrixToString,
  translate,
  translate3d,
} from "rematrix";
import type { Matrix, Matrix3D } from "rematrix";

class CurlMatrix {
  private m: Matrix3D;

  constructor(source?: CurlMatrix) {
    this.m = source ? ([...source.m] as Matrix3D) : identity();
  }

  clone() {
    return new CurlMatrix(this);
  }

  multiply(matrix: Matrix) {
    this.m = multiply(this.m, matrix);
    return this;
  }

  perspective(distance: number) {
    return this.multiply(perspective(distance));
  }

  translate(x: number, y = 0) {
    return this.multiply(translate(x, y));
  }

  translate3d(x: number, y: number, z: number) {
    return this.multiply(translate3d(x, y, z));
  }

  rotateY(degrees: number) {
    return this.multiply(rotateY(degrees));
  }

  transformX(x: number) {
    return (x * this.m[0] + this.m[12]) / (x * this.m[3] + this.m[15]);
  }

  toString() {
    return matrixToString(this.m);
  }
}

export type FlipDirection = "left" | "right";
export type CurlFace = "front" | "back";

export interface CurlGeometry {
  progress: number;
  direction: FlipDirection | null;
  forwardDirection: FlipDirection;
  displayedPages: 1 | 2;
  frontImage: string | null;
  backImage: string | null;
  viewWidth: number;
  viewHeight: number;
  pageWidth: number;
  pageHeight: number;
  xMargin: number;
  yMargin: number;
  nPolygons: number;
  ambient: number;
  gloss: number;
  perspective: number;
}

export interface CurlStrip {
  key: string;
  face: CurlFace;
  image: string | null;
  lighting: string;
  backgroundPosition: string;
  transform: string;
  z: number;
}

export interface CurlFrame {
  strips: CurlStrip[];
  backFade: number;
  minX: number;
  maxX: number;
}

const LIGHTING_POINTS = [-0.5, -0.25, 0, 0.25, 0.5];
const SPECULAR_DEGREES = 30;
// The back face only becomes visible once the sheet passes 90 degrees, i.e.
// around progress 0.75, so the fade starts there and is finished before the
// page lands rather than lingering as a ghost over the destination.
const BACK_FADE_START = 0.75;
const BACK_FADE_END = 0.92;
const SPECULAR_POWER = 200;

const computeLighting = (rot: number, dRotate: number, ambient: number, gloss: number) => {
  const gradients: string[] = [];

  if (ambient < 1) {
    const blackness = 1 - ambient;
    const stops = LIGHTING_POINTS.map(
      (d) => (1 - Math.cos(((rot - dRotate * d) / 180) * Math.PI)) * blackness,
    );
    gradients.push(
      `linear-gradient(to right, ${stops
        .map((stop, index) => `rgba(0, 0, 0, ${stop}) ${index * 25}%`)
        .join(", ")})`,
    );
  }

  if (gloss > 0) {
    const stops = LIGHTING_POINTS.map((d) =>
      Math.max(
        Math.pow(Math.cos(((rot + SPECULAR_DEGREES - dRotate * d) / 180) * Math.PI), SPECULAR_POWER),
        Math.pow(Math.cos(((rot - SPECULAR_DEGREES - dRotate * d) / 180) * Math.PI), SPECULAR_POWER),
      ),
    );
    gradients.push(
      `linear-gradient(to right, ${stops
        .map((stop, index) => `rgba(255, 255, 255, ${stop * gloss}) ${index * 25}%`)
        .join(", ")})`,
    );
  }

  return gradients.join(",");
};

const computeFace = (geometry: CurlGeometry, face: CurlFace) => {
  const {
    nPolygons,
    pageWidth,
    pageHeight,
    xMargin,
    yMargin,
    viewWidth,
    perspective: perspectiveDistance,
    ambient,
    gloss,
    displayedPages,
    forwardDirection,
  } = geometry;

  let { progress, direction } = geometry;

  if (!direction) return { strips: [] as CurlStrip[], minX: 0, maxX: 0 };

  if (displayedPages === 1 && direction !== forwardDirection) {
    progress = 1 - progress;
    direction = forwardDirection;
  }

  const image = face === "front" ? geometry.frontImage : geometry.backImage;
  const polygonWidth = pageWidth / nPolygons;

  let pageX = xMargin;
  let originRight = false;

  if (displayedPages === 1) {
    if (forwardDirection === "right") {
      if (face === "back") {
        originRight = true;
        pageX = xMargin - pageWidth;
      }
    } else if (direction === "left") {
      if (face === "back") {
        pageX = pageWidth - xMargin;
      } else {
        originRight = true;
      }
    } else if (face === "front") {
      pageX = pageWidth - xMargin;
    } else {
      originRight = true;
    }
  } else if (direction === "left") {
    if (face === "back") {
      pageX = viewWidth / 2;
    } else {
      originRight = true;
    }
  } else if (face === "front") {
    pageX = viewWidth / 2;
  } else {
    originRight = true;
  }

  const pageMatrix = new CurlMatrix();
  pageMatrix.translate(viewWidth / 2);
  pageMatrix.perspective(perspectiveDistance);
  pageMatrix.translate(-viewWidth / 2);
  pageMatrix.translate(pageX, yMargin);

  let pageRotation = 0;
  if (progress > 0.5) {
    pageRotation = -(progress - 0.5) * 2 * 180;
  }
  if (direction === "left") {
    pageRotation = -pageRotation;
  }
  if (face === "back") {
    pageRotation += 180;
  }

  if (pageRotation) {
    if (originRight) {
      pageMatrix.translate(pageWidth, 0);
    }
    pageMatrix.rotateY(pageRotation);
    if (originRight) {
      pageMatrix.translate(-pageWidth, 0);
    }
  }

  const theta = progress < 0.5 ? progress * 2 * Math.PI : (1 - (progress - 0.5) * 2) * Math.PI;
  const safeTheta = theta === 0 ? 1e-9 : theta;
  const radius = pageWidth / safeTheta;
  const dRadian = safeTheta / nPolygons;

  let rotate = (dRadian / 2 / Math.PI) * 180;
  let dRotate = (dRadian / Math.PI) * 180;
  if (originRight) {
    rotate = (-safeTheta / Math.PI) * 180 + dRotate / 2;
  }
  if (face === "back") {
    rotate = -rotate;
    dRotate = -dRotate;
  }

  let radian = 0;
  let minX = Number.POSITIVE_INFINITY;
  let maxX = Number.NEGATIVE_INFINITY;
  const strips: CurlStrip[] = [];

  for (let i = 0; i < nPolygons; i += 1) {
    const backgroundPosition = `${(i / (nPolygons - 1)) * 100}% 0px`;
    const m = pageMatrix.clone();

    const rad = originRight ? safeTheta - radian : radian;
    let x = Math.sin(rad) * radius;
    if (originRight) {
      x = pageWidth - x;
    }
    let z = (1 - Math.cos(rad)) * radius;
    if (face === "back") {
      z = -z;
    }

    m.translate3d(x, 0, z);
    m.rotateY(-rotate);

    const x0 = m.transformX(0);
    const x1 = m.transformX(polygonWidth);
    maxX = Math.max(maxX, x0, x1);
    minX = Math.min(minX, x0, x1);

    const lighting = computeLighting(pageRotation - rotate, dRotate, ambient, gloss);

    radian += dRadian;
    rotate += dRotate;

    strips.push({
      key: `${face}${i}`,
      face,
      image,
      lighting,
      backgroundPosition,
      transform: m.toString(),
      z: Math.abs(Math.round(z)),
    });
  }

  return { strips, minX, maxX };
};

export const computeCurl = (geometry: CurlGeometry): CurlFrame => {
  if (!geometry.direction) {
    return { strips: [], backFade: 1, minX: 0, maxX: 0 };
  }

  const front = computeFace(geometry, "front");
  const back = computeFace(geometry, "back");
  const minX = Math.min(front.minX, back.minX);
  const maxX = Math.max(front.maxX, back.maxX);

  // The back of a turning page mirrors a page that is already on screen, so it
  // fades out over the last stretch of the flip instead of reading as a duplicate.
  const backFade =
    geometry.progress > BACK_FADE_START
      ? Math.max(0, 1 - (geometry.progress - BACK_FADE_START) / (BACK_FADE_END - BACK_FADE_START))
      : 1;

  return { strips: [...front.strips, ...back.strips], backFade, minX, maxX };
};

export const easeInOut = (x: number) => {
  if (x < 0.5) {
    return (x * x) / 2;
  }
  return 0.5 + ((2 * x - 1) ** 2) / 2;
};

export const polygonWidth = (pageWidth: number, nPolygons: number) =>
  `${Math.ceil(pageWidth / nPolygons + 1)}px`;

export const polygonBackgroundSize = (pageWidth: number, pageHeight: number) =>
  `${pageWidth}px ${pageHeight}px`;
