import { useEffect, useState } from "react";
import { ChevronLeft, ChevronRight, Maximize2, Minimize2 } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { FlipbookController } from "@/hooks/useFlipbook";
import { pageUrl, thumbUrl } from "@/lib/flipbook";
import "./flipbook.css";

interface FlipbookProps {
  book: FlipbookController;
  slug: string;
  pageCount: number;
  isFullscreen: boolean;
  onToggleFullscreen: () => void;
}

const StaticPage = ({
  slug,
  page,
  width,
  height,
  left,
  top,
  pageCount,
}: {
  slug: string;
  page: number;
  width: number;
  height: number;
  left: number;
  top: number;
  pageCount: number;
}) => {
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(false);
  }, [page, slug]);

  return (
    <div
      className="fb-page"
      style={{ width: `${width}px`, height: `${height}px`, left: `${left}px`, top: `${top}px` }}
    >
      <img
        className={`fb-page-lqip ${loaded ? "is-hidden" : ""}`}
        src={thumbUrl(slug, page)}
        alt=""
        aria-hidden="true"
      />
      <img
        className={`fb-page-img ${loaded ? "is-loaded" : ""}`}
        src={pageUrl(slug, page)}
        alt={`Page ${page} of ${pageCount}`}
        draggable={false}
        decoding="async"
        onLoad={() => setLoaded(true)}
        onError={() => setLoaded(true)}
      />
    </div>
  );
};

const Flipbook = ({ book, slug, pageCount, isFullscreen, onToggleFullscreen }: FlipbookProps) => {
  const {
    viewportRef,
    dragSurfaceRef,
    page,
    spread,
    displayedPages,
    canFlipLeft,
    canFlipRight,
    flipActive,
    strips,
    pageWidth,
    pageHeight,
    xMargin,
    yMargin,
    centerOffset,
    isReady,
    flipLeft,
    flipRight,
    tapToFlip,
    handlePointerDown,
    handlePointerMove,
    handlePointerUp,
    stripStyle,
  } = book;

  const label =
    displayedPages === 2 && spread.left && spread.right
      ? `${spread.left}–${spread.right}`
      : String(spread.left ?? spread.right ?? page);

  return (
    <div className="fb-root">
      <div
        ref={viewportRef}
        className="fb-viewport"
        onPointerDown={handlePointerDown}
        onPointerMove={handlePointerMove}
        onPointerUp={handlePointerUp}
        onPointerCancel={handlePointerUp}
      >
        <div
          className="fb-stage"
          style={{ transform: `translateX(${centerOffset}px)` }}
        >
          <div
            ref={dragSurfaceRef}
            className="fb-drag-surface"
            onClick={(event) => tapToFlip(event.clientX)}
          />

          <div className="fb-pages">
            {spread.left ? (
              <StaticPage
                key={`left-${spread.left}`}
                slug={slug}
                page={spread.left}
                width={pageWidth}
                height={pageHeight}
                left={xMargin}
                top={yMargin}
                pageCount={pageCount}
              />
            ) : null}
            {displayedPages === 2 && spread.right ? (
              <StaticPage
                key={`right-${spread.right}`}
                slug={slug}
                page={spread.right}
                width={pageWidth}
                height={pageHeight}
                left={xMargin + pageWidth}
                top={yMargin}
                pageCount={pageCount}
              />
            ) : null}
          </div>

          {flipActive ? (
            <div className="fb-strips">
              {strips.map((strip) => (
                <div
                  key={strip.key}
                  className={`fb-strip ${strip.image ? "" : "is-blank"}`}
                  style={stripStyle(strip)}
                >
                  {strip.lighting ? (
                    <div className="fb-lighting" style={{ backgroundImage: strip.lighting }} />
                  ) : null}
                </div>
              ))}
            </div>
          ) : null}
        </div>

        <button
          type="button"
          className="fb-edge fb-edge-left"
          onClick={flipLeft}
          disabled={!canFlipLeft}
          aria-label="Previous page"
        >
          <ChevronLeft className="h-5 w-5" />
        </button>
        <button
          type="button"
          className="fb-edge fb-edge-right"
          onClick={flipRight}
          disabled={!canFlipRight}
          aria-label="Next page"
        >
          <ChevronRight className="h-5 w-5" />
        </button>

        <div className="fb-hint">
          <span className="fb-counter">
            {label} / {pageCount}
          </span>
          <span className="fb-hint-text">Drag to flip · tap the sides to turn</span>
          <span className="fb-hint-actions">
            <Button
              type="button"
              variant="ghost"
              size="icon"
              className="h-7 w-7 text-white/70 hover:bg-white/10 hover:text-white"
              onClick={onToggleFullscreen}
              aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
            >
              {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
            </Button>
          </span>
        </div>
      </div>

      {!isReady ? <div className="fb-loading">Preparing pages…</div> : null}
      <span className="sr-only" role="status" aria-live="polite">
        {`Page ${page} of ${pageCount}`}
      </span>
    </div>
  );
};

export default Flipbook;
