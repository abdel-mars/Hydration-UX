import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { pageUrl as buildPageUrl } from "@/lib/flipbook";
import { computeCurl, easeInOut, polygonBackgroundSize, polygonWidth } from "@/lib/pageCurl";
import type { CurlStrip, FlipDirection } from "@/lib/pageCurl";

const FLIP_DURATION = 900;
const ZOOM_DURATION = 320;
const SWIPE_MIN = 3;
const COMMIT_THRESHOLD = 0.25;
const TAP_SLOP = 4;
const N_POLYGONS = 10;
const AMBIENT = 0.45;
const GLOSS = 0.55;
const PERSPECTIVE = 2400;
const FORWARD_DIRECTION: FlipDirection = "right";
const SPREAD_MIN_WIDTH = 1024;
const SPREAD_MIN_PAGES = 4;
const RENDER_WIDTH = 1654;

export type DisplayMode = "auto" | "single" | "spread";

export interface FlipbookSpread {
  left: number | null;
  right: number | null;
}

interface UseFlipbookOptions {
  slug: string;
  pageCount: number;
  aspect: number;
  startPage?: number;
  reducedMotion?: boolean;
  onPageChange?: (page: number) => void;
  onFlip?: (direction: FlipDirection) => void;
  onFlipLand?: (direction: FlipDirection | null, committed: boolean) => void;
}

interface FlipState {
  progress: number;
  direction: FlipDirection | null;
  frontImage: string | null;
  backImage: string | null;
  auto: boolean;
}

const IDLE_FLIP: FlipState = {
  progress: 0,
  direction: null,
  frontImage: null,
  backImage: null,
  auto: false,
};

const clamp = (value: number, min: number, max: number) => Math.min(Math.max(value, min), max);

export type FlipbookController = ReturnType<typeof useFlipbook>;

export const useFlipbook = ({
  slug,
  pageCount,
  aspect,
  startPage = 1,
  reducedMotion = false,
  onPageChange,
  onFlip,
  onFlipLand,
}: UseFlipbookOptions) => {
  const viewportElRef = useRef<HTMLDivElement | null>(null);
  const viewportObserverRef = useRef<ResizeObserver | null>(null);
  const dragSurfaceRef = useRef<HTMLDivElement | null>(null);
  const flipLoopRef = useRef<number | null>(null);
  const dragRef = useRef<{ x: number; y: number; maxMove: number } | null>(null);
  const dragDistanceRef = useRef(0);
  const pageRef = useRef(startPage);
  const directionRef = useRef<FlipDirection | null>(null);
  const spreadRef = useRef<FlipbookSpread>({ left: null, right: startPage });

  const [view, setView] = useState({ width: 0, height: 0 });
  const [mode, setMode] = useState<DisplayMode>("auto");
  const [page, setPage] = useState(startPage);
  const [spread, setSpread] = useState<FlipbookSpread>(spreadRef.current);
  const [flip, setFlip] = useState<FlipState>(IDLE_FLIP);
  const displayedPages: 1 | 2 =
    mode === "single"
      ? 1
      : mode === "spread"
        ? 2
        : view.width >= SPREAD_MIN_WIDTH && aspect <= 1 && pageCount >= SPREAD_MIN_PAGES
          ? 2
          : 1;

  const imageHeight = Math.round(RENDER_WIDTH / aspect);

  const geometry = useMemo(() => {
    const slotWidth = view.width / displayedPages;
    const scale = Math.min(slotWidth / RENDER_WIDTH, view.height / imageHeight, 1);
    const pageWidth = Math.round(RENDER_WIDTH * scale);
    const pageHeight = Math.round(imageHeight * scale);
    return {
      pageWidth,
      pageHeight,
      xMargin: (view.width - pageWidth * displayedPages) / 2,
      yMargin: (view.height - pageHeight) / 2,
    };
  }, [displayedPages, imageHeight, view.height, view.width]);

  const pageUrl = useCallback(
    (value: number | null | undefined) =>
      value && value >= 1 && value <= pageCount ? buildPageUrl(slug, value) : null,
    [pageCount, slug],
  );

  const spreadOf = useCallback(
    (value: number): FlipbookSpread => {
      if (value < 1 || value > pageCount) return { left: null, right: null };
      if (displayedPages === 1) return { left: value, right: null };
      if (value === 1) return { left: null, right: 1 };
      return { left: value, right: value + 1 <= pageCount ? value + 1 : null };
    },
    [displayedPages, pageCount],
  );

  const nextPage = useCallback(
    (value: number) => {
      if (displayedPages === 1) return value < pageCount ? value + 1 : null;
      if (value === 1) return pageCount >= 2 ? 2 : null;
      return value + 2 <= pageCount ? value + 2 : null;
    },
    [displayedPages, pageCount],
  );

  const prevPage = useCallback(
    (value: number) => {
      if (value <= 1) return null;
      if (displayedPages === 1) return value - 1;
      return value === 2 ? 1 : value - 2;
    },
    [displayedPages],
  );

  const snapPage = useCallback(
    (value: number) => {
      const target = clamp(value, 1, pageCount);
      if (displayedPages === 1 || target === 1) return target;
      if (target % 2 === 0) return target;
      return target + 1 <= pageCount ? target + 1 : target - 1;
    },
    [displayedPages, pageCount],
  );

  const canFlipLeft = !flip.direction && prevPage(page) !== null;
  const canFlipRight = !flip.direction && nextPage(page) !== null;

  const commitSpread = useCallback((value: number) => {
    const next = spreadOf(value);
    spreadRef.current = next;
    setSpread(next);
  }, [spreadOf]);

  const commitPage = useCallback(
    (value: number) => {
      pageRef.current = value;
      setPage(value);
      onPageChange?.(value);
    },
    [onPageChange],
  );

  const stopFlipLoop = useCallback(() => {
    if (flipLoopRef.current !== null) {
      cancelAnimationFrame(flipLoopRef.current);
      flipLoopRef.current = null;
    }
  }, []);

  const settleFlip = useCallback(
    (destination: number | null) => {
      stopFlipLoop();
      if (destination !== null) {
        commitPage(destination);
        commitSpread(destination);
      } else {
        commitSpread(pageRef.current);
      }
      onFlipLand?.(directionRef.current, destination !== null);
      directionRef.current = null;
      setFlip(IDLE_FLIP);
    },
    [commitPage, commitSpread, onFlipLand, stopFlipLoop],
  );

  const runAutoFlip = useCallback(
    (ease: boolean, destination: number | null) => {
      if (reducedMotion) {
        settleFlip(destination);
        return;
      }

      const startRatio = flip.progress;
      const duration = Math.max(1, FLIP_DURATION * (1 - startRatio));
      const startedAt = performance.now();
      onFlip?.(directionRef.current ?? FORWARD_DIRECTION);

      const tick = () => {
        const ratio = Math.min(1, startRatio + (performance.now() - startedAt) / duration);
        setFlip((current) => ({
          ...current,
          auto: true,
          progress: ease ? easeInOut(ratio) : ratio,
        }));
        if (ratio < 1) {
          flipLoopRef.current = requestAnimationFrame(tick);
        } else {
          settleFlip(destination);
        }
      };

      flipLoopRef.current = requestAnimationFrame(tick);
    },
    [flip.progress, onFlip, reducedMotion, settleFlip],
  );

  const revertFlip = useCallback(() => {
    if (reducedMotion) {
      settleFlip(null);
      return;
    }

    const startRatio = flip.progress;
    const duration = Math.max(1, FLIP_DURATION * startRatio);
    const startedAt = performance.now();

    const tick = () => {
      const ratio = Math.max(0, startRatio - (startRatio * (performance.now() - startedAt)) / duration);
      setFlip((current) => ({ ...current, progress: ratio }));
      if (ratio > 0) {
        flipLoopRef.current = requestAnimationFrame(tick);
      } else {
        settleFlip(null);
      }
    };

    flipLoopRef.current = requestAnimationFrame(tick);
  }, [flip.progress, reducedMotion, settleFlip]);

  const flipStart = useCallback(
    (direction: FlipDirection, auto: boolean) => {
      const current = pageRef.current;
      const destination = direction === FORWARD_DIRECTION ? nextPage(current) : prevPage(current);
      if (destination === null) return;

      const currentSpread = spreadOf(current);
      let frontImage: string | null = null;
      let backImage: string | null = null;
      let nextSpread: FlipbookSpread;

      if (displayedPages === 1) {
        frontImage = pageUrl(direction === FORWARD_DIRECTION ? current : destination);
        backImage = null;
        nextSpread =
          direction === FORWARD_DIRECTION ? spreadOf(destination) : spreadOf(current);
      } else {
        frontImage = pageUrl(
          direction === FORWARD_DIRECTION ? currentSpread.right : currentSpread.left,
        );
        backImage = pageUrl(destination);
        nextSpread = spreadOf(destination);
      }

      directionRef.current = direction;
      spreadRef.current = nextSpread;
      setSpread(nextSpread);
      setFlip({ progress: 0, direction, frontImage, backImage, auto: false });

      if (auto) {
        requestAnimationFrame(() => runAutoFlip(true, destination));
      }
    },
    [displayedPages, nextPage, pageUrl, prevPage, runAutoFlip, spreadOf],
  );

  const flipLeft = useCallback(() => {
    if (canFlipLeft) flipStart("left", true);
  }, [canFlipLeft, flipStart]);

  const flipRight = useCallback(() => {
    if (canFlipRight) flipStart("right", true);
  }, [canFlipRight, flipStart]);

  const goToPage = useCallback(
    (value: number) => {
      stopFlipLoop();
      const target = snapPage(value);
      commitPage(target);
      commitSpread(target);
      setFlip(IDLE_FLIP);
    },
    [commitPage, commitSpread, snapPage, stopFlipLoop],
  );

  const measureViewport = useCallback((node: HTMLDivElement | null) => {
    viewportObserverRef.current?.disconnect();
    viewportObserverRef.current = null;
    viewportElRef.current = node;

    if (!node) return;

    const measure = () =>
      setView((current) => {
        const width = node.clientWidth;
        const height = node.clientHeight;
        return current.width === width && current.height === height ? current : { width, height };
      });

    measure();

    if (typeof ResizeObserver !== "undefined") {
      const observer = new ResizeObserver(measure);
      observer.observe(node);
      viewportObserverRef.current = observer;
    }
  }, []);

  useEffect(
    () => () => {
      viewportObserverRef.current?.disconnect();
    },
    [],
  );

  useEffect(() => {
    // slug is a dependency so switching documents always starts from page 1 of
    // the new document, even when both open on the same page number.
    stopFlipLoop();
    setFlip(IDLE_FLIP);
    directionRef.current = null;
    const target = snapPage(startPage);
    pageRef.current = target;
    setPage(target);
    commitSpread(target);
  }, [commitSpread, slug, snapPage, startPage, stopFlipLoop]);

  useEffect(() => {
    commitSpread(pageRef.current);
  }, [commitSpread, displayedPages]);

  const preloadedRef = useRef<Set<string>>(new Set());

  const preload = useCallback((url: string | null) => {
    if (!url || preloadedRef.current.has(url)) return;
    preloadedRef.current.add(url);
    const image = new Image();
    image.src = url;
  }, []);

  useEffect(() => {
    preload(pageUrl(spread.left));
    preload(pageUrl(spread.right));
    preload(pageUrl(nextPage(page)));
    const previous = prevPage(page);
    if (previous !== null) {
      preload(pageUrl(spreadOf(previous).left));
      preload(pageUrl(spreadOf(previous).right));
    }
  }, [nextPage, page, pageUrl, preload, prevPage, spread.left, spread.right, spreadOf]);

  useEffect(() => () => stopFlipLoop(), [stopFlipLoop]);

  const handlePointerDown = (event: React.PointerEvent) => {
    if (event.button !== 0) return;
    dragDistanceRef.current = 0;
    dragRef.current = { x: event.clientX, y: event.clientY, maxMove: 0 };
    dragSurfaceRef.current?.setPointerCapture?.(event.pointerId);
  };

  const handlePointerMove = (event: React.PointerEvent) => {
    const drag = dragRef.current;
    if (!drag) return;

    const deltaX = event.clientX - drag.x;
    const deltaY = event.clientY - drag.y;
    drag.maxMove = Math.max(drag.maxMove, Math.abs(deltaX), Math.abs(deltaY));
    dragDistanceRef.current = drag.maxMove;

    if (Math.abs(deltaY) > Math.abs(deltaX)) return;
    if (deltaX > 0) {
      if (flip.direction === null && prevPage(pageRef.current) !== null && deltaX >= SWIPE_MIN) {
        flipStart("left", false);
      }
      if (flip.direction === "left") {
        setFlip((state) => ({ ...state, progress: Math.min(1, deltaX / geometry.pageWidth) }));
      }
    } else if (deltaX < 0) {
      if (flip.direction === null && nextPage(pageRef.current) !== null && deltaX <= -SWIPE_MIN) {
        flipStart("right", false);
      }
      if (flip.direction === "right") {
        setFlip((state) => ({ ...state, progress: Math.min(1, -deltaX / geometry.pageWidth) }));
      }
    }
  };

  const handlePointerUp = (event: React.PointerEvent) => {
    dragSurfaceRef.current?.releasePointerCapture?.(event.pointerId);
    if (!dragRef.current) return;
    dragRef.current = null;
    if (flip.auto) return;

    if (flip.direction !== null) {
      const destination =
        flip.direction === FORWARD_DIRECTION
          ? nextPage(pageRef.current)
          : prevPage(pageRef.current);
      if (flip.progress > COMMIT_THRESHOLD) {
        runAutoFlip(false, destination);
      } else {
        revertFlip();
      }
    }
  };

  const tapToFlip = useCallback(
    (clientX: number) => {
      if (dragDistanceRef.current > TAP_SLOP) return;
      const viewport = viewportElRef.current;
      if (!viewport) return;
      const rect = viewport.getBoundingClientRect();
      if (clientX < rect.left + rect.width / 2) {
        flipLeft();
      } else {
        flipRight();
      }
    },
    [flipLeft, flipRight],
  );

  const curl = useMemo(
    () =>
      computeCurl({
        progress: flip.progress,
        direction: flip.direction,
        forwardDirection: FORWARD_DIRECTION,
        displayedPages,
        frontImage: flip.frontImage,
        backImage: flip.backImage,
        viewWidth: view.width,
        viewHeight: view.height,
        pageWidth: geometry.pageWidth,
        pageHeight: geometry.pageHeight,
        xMargin: geometry.xMargin,
        yMargin: geometry.yMargin,
        nPolygons: N_POLYGONS,
        ambient: AMBIENT,
        gloss: GLOSS,
        perspective: PERSPECTIVE,
      }),
    [displayedPages, flip, geometry, view.height, view.width],
  );

  const stripWidth = polygonWidth(geometry.pageWidth, N_POLYGONS);
  const stripBackgroundSize = polygonBackgroundSize(geometry.pageWidth, geometry.pageHeight);

  const stripStyle = useCallback(
    (strip: CurlStrip): React.CSSProperties => ({
      backgroundImage: strip.image ? `url(${strip.image})` : undefined,
      backgroundSize: stripBackgroundSize,
      backgroundPosition: strip.backgroundPosition,
      width: stripWidth,
      height: `${geometry.pageHeight}px`,
      transform: strip.transform,
      zIndex: strip.z,
      opacity: strip.face === "back" ? curl.backFade : 1,
    }),
    [curl.backFade, geometry.pageHeight, stripBackgroundSize, stripWidth],
  );

  const boundingLeft =
    displayedPages === 1 ? geometry.xMargin : spread.left ? geometry.xMargin : view.width / 2;
  const boundingRight =
    displayedPages === 1
      ? view.width - geometry.xMargin
      : spread.right
        ? view.width - geometry.xMargin
        : view.width / 2;
  const centerOffset = Math.round(view.width / 2 - (boundingLeft + boundingRight) / 2);

  return {
    viewportRef: measureViewport,
    dragSurfaceRef,
    dragDistanceRef,
    page,
    spread,
    displayedPages,
    pageCount,
    mode,
    setMode,
    canFlipLeft,
    canFlipRight,
    flipActive: flip.direction !== null,
    strips: curl.strips,
    pageWidth: geometry.pageWidth,
    pageHeight: geometry.pageHeight,
    xMargin: geometry.xMargin,
    yMargin: geometry.yMargin,
    centerOffset,
    isReady: view.width > 0 && view.height > 0,
    flipLeft,
    flipRight,
    goToPage,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    tapToFlip,
    pageUrl,
    stripStyle,
  };
};
