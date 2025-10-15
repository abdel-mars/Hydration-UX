import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight, Maximize2 } from "lucide-react";

interface FlipBookProps {
  pdfPath: string;
  title: string;
}

export const FlipBook = ({ pdfPath, title }: FlipBookProps) => {
  const [isFlipped, setIsFlipped] = useState(false);
  const [isFullscreen, setIsFullscreen] = useState(false);

  const handleFlip = () => {
    setIsFlipped(!isFlipped);
  };

  const handleFullscreen = () => {
    setIsFullscreen(!isFullscreen);
  };

  return (
    <>
      <div className="relative group">
        {/* Book Container */}
        <div 
          className="relative bg-card rounded-lg overflow-hidden transition-all duration-500 hover:shadow-[var(--shadow-book-hover)] cursor-pointer"
          style={{
            boxShadow: 'var(--shadow-book)',
            transform: 'perspective(1000px)',
          }}
          onClick={handleFlip}
        >
          {/* Book Spine Effect */}
          <div className="absolute left-1/2 top-0 bottom-0 w-1 bg-border z-10" />
          
          {/* PDF Viewer */}
          <div className="relative aspect-[4/3] bg-white">
            <iframe
              src={pdfPath}
              className="w-full h-full"
              title={`${title} PDF`}
              style={{
                border: 'none',
                pointerEvents: 'none',
              }}
            />
            
            {/* Overlay for interactivity */}
            <div className="absolute inset-0 bg-gradient-to-b from-transparent via-transparent to-black/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
          </div>

          {/* Page Edge Shadow */}
          <div className="absolute inset-0 pointer-events-none">
            <div className="absolute left-1/2 top-0 bottom-0 w-8 bg-gradient-to-r from-black/5 to-transparent" />
            <div className="absolute right-1/2 top-0 bottom-0 w-8 bg-gradient-to-l from-black/5 to-transparent" />
          </div>

          {/* Navigation Buttons */}
          <div className="absolute bottom-4 left-1/2 -translate-x-1/2 flex gap-2 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleFlip();
              }}
            >
              <ChevronLeft className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleFullscreen();
              }}
            >
              <Maximize2 className="w-4 h-4" />
            </Button>
            <Button
              size="sm"
              variant="secondary"
              className="bg-white/90 hover:bg-white shadow-lg backdrop-blur-sm"
              onClick={(e) => {
                e.stopPropagation();
                handleFlip();
              }}
            >
              <ChevronRight className="w-4 h-4" />
            </Button>
          </div>
        </div>

        {/* Corner Fold Effect */}
        <div className="absolute top-0 right-0 w-8 h-8 bg-gradient-to-br from-border to-transparent opacity-50" />
      </div>

      {/* Fullscreen Modal */}
      {isFullscreen && (
        <div className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-8">
          <div className="relative w-full h-full max-w-6xl">
            <Button
              size="sm"
              variant="secondary"
              className="absolute top-4 right-4 z-10"
              onClick={handleFullscreen}
            >
              Close
            </Button>
            <iframe
              src={pdfPath}
              className="w-full h-full rounded-lg"
              title={`${title} PDF Fullscreen`}
              style={{ border: 'none' }}
            />
          </div>
        </div>
      )}
    </>
  );
};
