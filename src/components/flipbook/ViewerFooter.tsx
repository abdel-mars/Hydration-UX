import { ChevronLeft, ChevronRight, LayoutGrid } from "lucide-react";
import type { Deliverable } from "@/lib/flipbook";
import "./flipbook.css";

interface ViewerFooterProps {
  previous: Deliverable | null;
  next: Deliverable | null;
  isLast: boolean;
  onOpenDeliverable: (slug: string) => void;
  onClose: () => void;
}

const Label = ({ deliverable }: { deliverable: Deliverable }) => (
  <span className="truncate">
    <span className="text-[0.65rem] font-medium text-white/45 tabular-nums">
      {String(deliverable.order).padStart(2, "0")}
    </span>{" "}
    {deliverable.title}
  </span>
);

const ViewerFooter = ({
  previous,
  next,
  isLast,
  onOpenDeliverable,
  onClose,
}: ViewerFooterProps) => (
  <div className="fb-footer">
    {previous ? (
      <button
        type="button"
        className="fb-footer-link"
        onClick={() => onOpenDeliverable(previous.slug)}
      >
        <ChevronLeft className="h-4 w-4 shrink-0" />
        <Label deliverable={previous} />
      </button>
    ) : (
      <span />
    )}

    <button type="button" className="fb-footer-all" onClick={onClose}>
      <LayoutGrid className="h-3.5 w-3.5" />
      All deliverables
    </button>

    {next ? (
      <button type="button" className="fb-footer-link" onClick={() => onOpenDeliverable(next.slug)}>
        <Label deliverable={next} />
        <ChevronRight className="h-4 w-4 shrink-0" />
      </button>
    ) : (
      <button type="button" className="fb-footer-link" onClick={onClose}>
        <span className="truncate">{isLast ? "Back to all deliverables" : "Close"}</span>
        <ChevronRight className="h-4 w-4 shrink-0" />
      </button>
    )}
  </div>
);

export default ViewerFooter;
