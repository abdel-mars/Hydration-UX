import { useEffect, useState } from "react";
import {
  ChevronLeft,
  ChevronRight,
  ChevronsLeft,
  ChevronsRight,
  LayoutGrid,
  Maximize2,
  Minimize2,
  Volume2,
  VolumeX,
  X,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import type { FlipbookSpread } from "@/hooks/useFlipbook";
import { thumbUrl } from "@/lib/flipbook";
import "./flipbook.css";

interface ViewerToolbarProps {
  slug: string;
  title: string;
  pageCount: number;
  page: number;
  spread: FlipbookSpread;
  displayedPages: 1 | 2;
  canFlipLeft: boolean;
  canFlipRight: boolean;
  isFullscreen: boolean;
  soundOn: boolean;
  onFlipLeft: () => void;
  onFlipRight: () => void;
  onGoToPage: (page: number) => void;
  onToggleFullscreen: () => void;
  onToggleSound: () => void;
  onClose: () => void;
}

const ThumbnailGrid = ({
  slug,
  pageCount,
  page,
  onSelect,
}: {
  slug: string;
  pageCount: number;
  page: number;
  onSelect: (page: number) => void;
}) => (
  <ol className="fb-thumbs">
    {Array.from({ length: pageCount }, (_, index) => index + 1).map((value) => (
      <li key={value}>
        <button
          type="button"
          className={`fb-thumb ${value === page ? "is-active" : ""}`}
          onClick={() => onSelect(value)}
          aria-label={`Go to page ${value}`}
          aria-current={value === page}
        >
          <img src={thumbUrl(slug, value)} alt="" loading="lazy" decoding="async" />
          <span>{value}</span>
        </button>
      </li>
    ))}
  </ol>
);

const ViewerToolbar = ({
  slug,
  title,
  pageCount,
  page,
  spread,
  displayedPages,
  canFlipLeft,
  canFlipRight,
  isFullscreen,
  soundOn,
  onFlipLeft,
  onFlipRight,
  onGoToPage,
  onToggleFullscreen,
  onToggleSound,
  onClose,
}: ViewerToolbarProps) => {
  const [draft, setDraft] = useState(String(page));

  useEffect(() => {
    setDraft(String(page));
  }, [page]);

  const visiblePages =
    displayedPages === 2 && spread.left && spread.right
      ? `${spread.left}–${spread.right}`
      : String(spread.left ?? spread.right ?? page);

  return (
    <div className="fb-toolbar">
      <div className="fb-toolbar-side">
        <p className="fb-toolbar-title">{title}</p>
      </div>

      <div className="fb-toolbar-center">
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onGoToPage(1)}
          disabled={!canFlipLeft || page <= 1}
          aria-label="First page"
          className="fb-tool-button fb-hide-sm"
        >
          <ChevronsLeft className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onFlipLeft}
          disabled={!canFlipLeft}
          aria-label="Previous page"
          className="fb-tool-button"
        >
          <ChevronLeft className="h-4 w-4" />
        </Button>

        <form
          className="fb-page-form"
          onSubmit={(event) => {
            event.preventDefault();
            const value = Number.parseInt(draft, 10);
            if (Number.isFinite(value)) onGoToPage(value);
          }}
        >
          <span className="fb-page-label">{visiblePages}</span>
          <span className="fb-page-total">/ {pageCount}</span>
          <input
            className="fb-page-input"
            value={draft}
            onChange={(event) => setDraft(event.target.value)}
            onBlur={() => setDraft(String(page))}
            onFocus={(event) => event.currentTarget.select()}
            inputMode="numeric"
            aria-label="Page number"
          />
        </form>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onFlipRight}
          disabled={!canFlipRight}
          aria-label="Next page"
          className="fb-tool-button"
        >
          <ChevronRight className="h-4 w-4" />
        </Button>
        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={() => onGoToPage(pageCount)}
          disabled={!canFlipRight || page >= pageCount}
          aria-label="Last page"
          className="fb-tool-button fb-hide-sm"
        >
          <ChevronsRight className="h-4 w-4" />
        </Button>
      </div>

      <div className="fb-toolbar-side fb-toolbar-end">
        <Sheet>
          <SheetTrigger asChild>
            <Button variant="ghost" size="icon" className="fb-tool-button" aria-label="Show all pages">
              <LayoutGrid className="h-4 w-4" />
            </Button>
          </SheetTrigger>
          <SheetContent side="right" className="w-full max-w-sm overflow-y-auto bg-background p-6">
            <SheetHeader>
              <SheetTitle>All pages</SheetTitle>
            </SheetHeader>
            <ThumbnailGrid slug={slug} pageCount={pageCount} page={page} onSelect={onGoToPage} />
          </SheetContent>
        </Sheet>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleSound}
          className="fb-tool-button fb-hide-sm"
          aria-label={soundOn ? "Mute page sound" : "Enable page sound"}
          aria-pressed={soundOn}
        >
          {soundOn ? <Volume2 className="h-4 w-4" /> : <VolumeX className="h-4 w-4" />}
        </Button>

        <Button
          type="button"
          variant="ghost"
          size="icon"
          onClick={onToggleFullscreen}
          className="fb-tool-button"
          aria-label={isFullscreen ? "Exit fullscreen" : "Enter fullscreen"}
        >
          {isFullscreen ? <Minimize2 className="h-4 w-4" /> : <Maximize2 className="h-4 w-4" />}
        </Button>

        <Button type="button" variant="ghost" size="icon" onClick={onClose} className="fb-tool-button" aria-label="Close viewer">
          <X className="h-4 w-4" />
        </Button>
      </div>
    </div>
  );
};

export default ViewerToolbar;
