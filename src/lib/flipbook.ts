import deliverablesJson from "@/data/deliverables.json";
import manifestJson from "@/data/flipbook-manifest.json";
import { assetUrl } from "@/lib/utils";

export interface Deliverable {
  order: number;
  slug: string;
  title: string;
  description: string;
  pdf: string;
  isFinal?: boolean;
}

export interface FlipbookMeta {
  pageCount: number;
  aspect: number;
  pixelWidth: number;
  pixelHeight: number;
  bytes: number;
}

export const DELIVERABLES = deliverablesJson as Deliverable[];

export const FLIPBOOK_MANIFEST = manifestJson as unknown as Record<string, FlipbookMeta>;

const pad = (page: number) => String(page).padStart(2, "0");

export const pageUrl = (slug: string, page: number) =>
  assetUrl(`/flipbook/${slug}/page-${pad(page)}.jpg`);

export const thumbUrl = (slug: string, page: number) =>
  assetUrl(`/flipbook/${slug}/thumb-${pad(page)}.jpg`);

export const getDeliverable = (slug: string | null | undefined) =>
  DELIVERABLES.find((deliverable) => deliverable.slug === slug);

export const getAdjacentDeliverable = (slug: string, offset: 1 | -1) => {
  const index = DELIVERABLES.findIndex((deliverable) => deliverable.slug === slug);
  if (index === -1) return null;
  return DELIVERABLES[index + offset] ?? null;
};

export const getMeta = (slug: string) => FLIPBOOK_MANIFEST[slug];

export const formatPageCount = (count: number) =>
  `${count} ${count === 1 ? "page" : "pages"}`;
