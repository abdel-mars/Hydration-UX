import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { useFlipbook } from "@/hooks/useFlipbook";
import { useFlipSound } from "@/hooks/useFlipSound";
import { useFullscreen } from "@/hooks/useFullscreen";
import { getAdjacentDeliverable, getDeliverable, getMeta } from "@/lib/flipbook";
import Flipbook from "./Flipbook";
import ViewerToolbar from "./ViewerToolbar";
import ViewerFooter from "./ViewerFooter";
import "./flipbook.css";

const SOUND_KEY = "hydration-flipbook:sound";

const readSoundPreference = () => {
  try {
    return window.localStorage.getItem(SOUND_KEY) === "1";
  } catch {
    return false;
  }
};

const readViewerQuery = (search: URLSearchParams) => {
  const slug = search.get("doc");
  const deliverable = getDeliverable(slug);
  if (!slug || !deliverable) return null;

  const meta = getMeta(slug);
  if (!meta) return null;

  const requested = Number.parseInt(search.get("page") ?? "1", 10);
  const page = Number.isFinite(requested)
    ? Math.min(Math.max(requested, 1), meta.pageCount)
    : 1;

  return { slug, page };
};

const DeliverableViewer = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const shellRef = useRef<HTMLDivElement | null>(null);
  const query = useMemo(() => readViewerQuery(searchParams), [searchParams]);
  const { isFullscreen, toggle: toggleFullscreen } = useFullscreen(shellRef);
  const { onLift, onLand } = useFlipSound();
  const [soundOn, setSoundOn] = useState(false);

  useEffect(() => {
    setSoundOn(readSoundPreference());
  }, []);

  const handlePageChange = useCallback(
    (page: number) => {
      if (!query) return;
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set("doc", query.slug);
          next.set("page", String(page));
          return next;
        },
        { replace: true },
      );
    },
    [query, setSearchParams],
  );

  const slug = query?.slug ?? "";
  const meta = slug ? getMeta(slug) : undefined;
  const deliverable = getDeliverable(slug);

  const book = useFlipbook({
    slug,
    pageCount: meta?.pageCount ?? 1,
    aspect: meta?.aspect ?? 1,
    startPage: query?.page ?? 1,
    reducedMotion:
      typeof window !== "undefined" &&
      window.matchMedia("(prefers-reduced-motion: reduce)").matches,
    onPageChange: handlePageChange,
    onFlip: soundOn ? onLift : undefined,
    onFlipLand: soundOn ? onLand : undefined,
  });

  const { flipLeft, flipRight, goToPage, page } = book;

  useEffect(() => {
    if (!query) return;

    const onKeyDown = (event: KeyboardEvent) => {
      const target = event.target as HTMLInputElement | HTMLElement | null;
      const tag = target?.tagName;
      const isTextEntry =
        tag === "TEXTAREA" ||
        (tag === "INPUT" &&
          !["checkbox", "radio", "button", "submit", "range", "file"].includes(
            (target as HTMLInputElement).type,
          ));

      if (isTextEntry && (event.key.length === 1 || event.key === "Backspace" || event.key === "Delete")) {
        return;
      }
      switch (event.key) {
        case "ArrowRight":
        case "ArrowDown":
        case "PageDown":
          event.preventDefault();
          flipRight();
          break;
        case "ArrowLeft":
        case "ArrowUp":
        case "PageUp":
          event.preventDefault();
          flipLeft();
          break;
        case " ":
          event.preventDefault();
          flipRight();
          break;
        case "Home":
          event.preventDefault();
          goToPage(1);
          break;
        case "End":
          event.preventDefault();
          goToPage(meta?.pageCount ?? 1);
          break;
        default:
          break;
      }
    };

    window.addEventListener("keydown", onKeyDown);
    return () => window.removeEventListener("keydown", onKeyDown);
  }, [flipLeft, flipRight, goToPage, meta?.pageCount, query]);

  useEffect(() => {
    if (!query) return;
    const previous = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previous;
    };
  }, [query]);

  const close = useCallback(() => {
    if (document.fullscreenElement) {
      document.exitFullscreen().catch(() => undefined);
      return;
    }
    if (window.history.state?.flipbook) {
      window.history.back();
      return;
    }
    setSearchParams({}, { replace: true });
  }, [setSearchParams]);

  const openAdjacent = useCallback(
    (targetSlug: string) => {
      setSearchParams({ doc: targetSlug, page: "1" });
    },
    [setSearchParams],
  );

  const toggleSound = () => {
    setSoundOn((current) => {
      const next = !current;
      try {
        window.localStorage.setItem(SOUND_KEY, next ? "1" : "0");
      } catch {
        /* storage is optional */
      }
      return next;
    });
  };

  if (!query || !meta || !deliverable) return null;

  return (
    <Dialog open onOpenChange={(open) => !open && close()}>
      <DialogContent
        className="flex h-[min(94vh,940px)] w-[min(96vw,1440px)] max-w-none flex-col gap-0 overflow-hidden border-white/10 bg-transparent p-0 shadow-2xl [&>button]:hidden"
        aria-describedby={undefined}
      >
        <DialogTitle className="sr-only">{deliverable.title}</DialogTitle>
        <div ref={shellRef} className="fb-shell">
          <ViewerToolbar
            slug={slug}
            title={deliverable.title}
            pageCount={meta.pageCount}
            page={page}
            spread={book.spread}
            displayedPages={book.displayedPages}
            canFlipLeft={book.canFlipLeft}
            canFlipRight={book.canFlipRight}
            isFullscreen={isFullscreen}
            soundOn={soundOn}
            onFlipLeft={flipLeft}
            onFlipRight={flipRight}
            onGoToPage={goToPage}
            onToggleFullscreen={toggleFullscreen}
            onToggleSound={toggleSound}
            onClose={close}
          />
          <Flipbook
            book={book}
            slug={slug}
            pageCount={meta.pageCount}
            isFullscreen={isFullscreen}
            onToggleFullscreen={toggleFullscreen}
          />
          <ViewerFooter
            previous={getAdjacentDeliverable(slug, -1)}
            next={getAdjacentDeliverable(slug, 1)}
            isLast={getAdjacentDeliverable(slug, 1) === null}
            onOpenDeliverable={openAdjacent}
            onClose={close}
          />
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default DeliverableViewer;
