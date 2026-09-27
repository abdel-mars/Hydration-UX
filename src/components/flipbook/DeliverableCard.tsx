import { useState } from "react";
import { ArrowUpRight, BookOpen } from "lucide-react";
import { getMeta, thumbUrl } from "@/lib/flipbook";
import { DELIVERABLES } from "@/lib/flipbook";
import type { Deliverable } from "@/lib/flipbook";

interface DeliverableCardProps {
  deliverable: Deliverable;
  onOpen: (slug: string) => void;
  index: number;
  featured?: boolean;
  className?: string;
}

const total = DELIVERABLES.length;

const DeliverableCard = ({
  deliverable,
  onOpen,
  index,
  featured = false,
  className,
}: DeliverableCardProps) => {
  const [loaded, setLoaded] = useState(false);
  const meta = getMeta(deliverable.slug);
  const pageCount = meta?.pageCount ?? 0;
  const isLandscape = (meta?.aspect ?? 1) > 1;

  const cover = (
    <button
      type="button"
      onClick={() => onOpen(deliverable.slug)}
      className={`group relative block w-full overflow-hidden rounded-xl border border-border/70 bg-gradient-to-br from-slate-100 to-slate-200/80 p-2.5 text-left shadow-sm transition-all duration-300 hover:-translate-y-1 hover:border-accent/40 hover:shadow-xl hover:shadow-accent/15 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 ${
        featured ? "max-w-[240px] shrink-0" : ""
      }`}
      aria-label={`Open ${deliverable.title}, ${pageCount} ${pageCount === 1 ? "page" : "pages"}`}
    >
      <span className="relative block aspect-[3/4] w-full overflow-hidden rounded-md bg-white ring-1 ring-inset ring-black/[0.07] shadow-[0_1px_2px_rgba(0,0,0,0.06),0_10px_24px_-12px_rgba(0,0,0,0.35)]">
        <img
          src={thumbUrl(deliverable.slug, 1)}
          alt=""
          loading="lazy"
          decoding="async"
          onLoad={() => setLoaded(true)}
          className={`h-full w-full transition-opacity duration-500 ${
            isLandscape ? "object-contain object-top" : "object-cover object-top"
          } ${loaded ? "opacity-100" : "opacity-0"}`}
        />
        <span className="pointer-events-none absolute inset-0 bg-gradient-to-t from-black/65 via-black/5 to-transparent" />
        <span className="absolute inset-x-0 bottom-0 flex items-end justify-between gap-2 p-3">
          <span className="flex items-center gap-1.5 text-xs font-semibold text-white">
            <BookOpen className="h-3.5 w-3.5" />
            Read
            <span className="rounded-full bg-white/25 px-1.5 py-px text-[0.65rem] font-medium tabular-nums">
              {pageCount}
            </span>
          </span>
          <ArrowUpRight className="h-4 w-4 text-white transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5" />
        </span>
      </span>
    </button>
  );

  if (featured) {
    return (
      <div className={`animate-fade-in ${className ?? ""}`} style={{ animationDelay: `${index * 0.08}s` }}>
        {cover}
      </div>
    );
  }

  return (
    <div
      className={`flex h-full flex-col animate-fade-in ${className ?? ""}`}
      style={{ animationDelay: `${index * 0.08}s` }}
    >
      <div className="mb-6 flex-1">
        <div className="mb-2 flex items-baseline gap-1.5 text-sm leading-none">
          <span className="font-bold text-accent tabular-nums">
            {String(deliverable.order).padStart(2, "0")}
          </span>
          <span className="text-xs text-muted-foreground/60 tabular-nums">
            / {String(total).padStart(2, "0")}
          </span>
        </div>
        <h3 className="mb-2 text-lg font-bold leading-snug">{deliverable.title}</h3>
        <p className="text-sm leading-relaxed text-muted-foreground">{deliverable.description}</p>
      </div>
      {cover}
    </div>
  );
};

export default DeliverableCard;
