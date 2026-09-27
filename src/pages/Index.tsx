import { useCallback } from "react";
import { useSearchParams } from "react-router-dom";
import DeliverableCard from "@/components/flipbook/DeliverableCard";
import DeliverableViewer from "@/components/flipbook/DeliverableViewer";
import { DELIVERABLES } from "@/lib/flipbook";
import { assetUrl } from "@/lib/utils";

const Index = () => {
  const [searchParams, setSearchParams] = useSearchParams();
  const gridItems = DELIVERABLES.filter((deliverable) => !deliverable.isFinal);
  const finalDeliverable = DELIVERABLES.find((deliverable) => deliverable.isFinal);

  const openDeliverable = useCallback(
    (slug: string) => {
      setSearchParams(
        (current) => {
          const next = new URLSearchParams(current);
          next.set("doc", slug);
          next.set("page", "1");
          return next;
        },
        { state: { flipbook: true } },
      );
    },
    [setSearchParams],
  );

  return (
    <div className="min-h-screen bg-background">
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
        <div className="flex justify-center py-4">
          <a
            href="https://github.com/abdel-mars"
            target="_blank"
            rel="noopener noreferrer"
            className="z-10 inline-block cursor-pointer rounded-full p-2 transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-accent/50 hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.8)]"
          >
            <svg
              className="h-8 w-8 text-foreground transition-colors duration-300 hover:text-accent"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z" />
            </svg>
          </a>
        </div>
        <div className="container relative mx-auto px-6 py-16 md:py-24">
          <div className="mx-auto max-w-4xl animate-fade-in text-center">
            <div className="mb-4 inline-block">
              <div className="mx-auto mb-6 h-1 w-20 bg-accent" />
            </div>
            <img
              src={assetUrl("/img/logoMarkBlack.png")}
              alt="Mars signature"
              className="mx-auto mb-4 h-40 w-50"
            />
            <h1 className="mb-6 text-5xl font-bold tracking-tight md:text-7xl">
              Hydration and Running
            </h1>
            <h2 className="mb-8 text-2xl font-medium text-muted-foreground md:text-3xl">
              Improving Athletes&apos; Hydration Experience
            </h2>
            <p className="mx-auto max-w-3xl text-lg leading-relaxed text-foreground/80 md:text-xl">
              A design research journey exploring how runners experience hydration, combining data,
              user interviews, and prototyping to build a non-digital solution.
            </p>
            <div className="mx-auto mt-8 h-1 w-20 bg-accent" />
          </div>
        </div>
      </header>

      <main className="container mx-auto px-6 py-16 md:py-24">
        <div className="mx-auto max-w-7xl">
          <div className="mb-16 text-center">
            <h2 className="mb-4 text-3xl font-bold md:text-4xl">Design Process</h2>
            <p className="mx-auto max-w-2xl text-lg text-muted-foreground">
              Explore each phase of the design journey — open any deliverable to read it page by page
            </p>
          </div>

          <div className="grid grid-cols-1 gap-8 sm:grid-cols-2 lg:grid-cols-3 lg:gap-10 xl:grid-cols-4">
            {gridItems.map((deliverable, index) => (
              <DeliverableCard
                key={deliverable.slug}
                deliverable={deliverable}
                index={index}
                onOpen={openDeliverable}
                className={
                  index === gridItems.length - 1 && gridItems.length % 3 === 1
                    ? "grid-orphan"
                    : undefined
                }
              />
            ))}
          </div>

          {finalDeliverable ? (
            <div className="mt-16 animate-fade-in" style={{ animationDelay: "0.7s" }}>
              <div className="mx-auto max-w-5xl">
                <div className="rounded-2xl border border-accent/40 bg-accent/[0.03] p-6 md:p-10">
                  <div className="grid items-center gap-8 md:grid-cols-[1fr_auto]">
                    <div>
                      <div className="mb-3 flex items-baseline gap-2.5">
                        <span className="text-4xl font-bold leading-none text-accent tabular-nums">
                          {String(finalDeliverable.order).padStart(2, "0")}
                        </span>
                        <span className="text-xs font-medium text-muted-foreground/60 tabular-nums">
                          / {String(DELIVERABLES.length).padStart(2, "0")}
                        </span>
                      </div>
                      <h3 className="mb-3 text-2xl font-bold md:text-3xl">{finalDeliverable.title}</h3>
                      <p className="max-w-2xl text-sm leading-relaxed text-muted-foreground md:text-base">
                        {finalDeliverable.description}
                      </p>
                    </div>
                    <DeliverableCard
                      deliverable={finalDeliverable}
                      index={gridItems.length}
                      featured
                      onOpen={openDeliverable}
                    />
                  </div>
                </div>
              </div>
            </div>
          ) : null}
        </div>
      </main>

      <footer className="mt-24 border-t border-border">
        <div className="container mx-auto px-6 py-12">
          <div className="mx-auto max-w-4xl text-center">
            <p className="text-sm text-muted-foreground">
              Designed by <span className="font-medium text-foreground">Mars</span>
            </p>
            <a
              href="http://elmahmoudi.42web.io"
              target="_blank"
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent transition-all hover:underline"
            >
              Visit Portfolio
              <svg className="h-4 w-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
                />
              </svg>
            </a>
          </div>
        </div>
      </footer>

      <DeliverableViewer />
    </div>
  );
};

export default Index;
