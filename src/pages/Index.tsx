import { useEffect } from "react";

const Index = () => {
  const phases = [
    {
      title: "Analytics",
      description: "Data analysis and user behavior insights to understand hydration patterns among runners.",
      flipbookLink: "https://online.flippingbook.com/view/444041480/",
      flipbookId: "88fbd29cfe"
    },
    {
      title: "Persona",
      description: "Creating detailed user personas based on research to represent target runner demographics.",
      flipbookLink: "https://online.flippingbook.com/view/444041481/",
      flipbookId: "88fbd29cff"
    },
    {
      title: "User Journey",
      description: "Mapping the complete experience of runners from pre-run preparation to post-run recovery.",
      flipbookLink: "https://online.flippingbook.com/view/444041482/",
      flipbookId: "88fbd29cfg"
    },
    {
      title: "Problem Statement",
      description: "Defining the core challenges runners face with hydration during training and events.",
      flipbookLink: "https://online.flippingbook.com/view/444041483/",
      flipbookId: "88fbd29cfh"
    },
    {
      title: "Ideation",
      description: "Brainstorming and exploring innovative solutions for improving hydration experiences.",
      flipbookLink: "https://online.flippingbook.com/view/444041484/",
      flipbookId: "88fbd29cfi"
    },
    {
      title: "Prototyping",
      description: "Building low and high-fidelity prototypes to test design concepts with real users.",
      flipbookLink: "https://online.flippingbook.com/view/444041485/",
      flipbookId: "88fbd29cfj"
    },
    {
      title: "User Testing",
      description: "Conducting usability tests to validate design decisions and gather feedback.",
      flipbookLink: "https://online.flippingbook.com/view/444041486/",
      flipbookId: "88fbd29cfk"
    },
    {
      title: "Iteration",
      description: "Refining the design based on user feedback and testing insights.",
      flipbookLink: "https://online.flippingbook.com/view/444041487/",
      flipbookId: "88fbd29cfl"
    },
    {
      title: "Final Design",
      description: "The complete design solution with all refinements and final deliverables.",
      flipbookLink: "https://online.flippingbook.com/view/444041488/",
      flipbookId: "88fbd29cfm"
    }
  ];

  useEffect(() => {
    // Load FlippingBook embed script
    const script = document.createElement('script');
    script.src = 'https://online.flippingbook.com/EmbedScriptUrl.aspx?m=redir&hid=444041480';
    script.async = true;
    script.defer = true;
    document.body.appendChild(script);

    return () => {
      document.body.removeChild(script);
    };
  }, []);

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <header className="relative overflow-hidden border-b border-border">
        <div className="absolute inset-0 bg-gradient-to-br from-accent/5 to-transparent" />
        <div className="container mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-block mb-4">
              <div className="h-1 w-20 bg-accent mx-auto mb-6" />
            </div>
            <h1 className="text-5xl md:text-7xl font-bold mb-6 tracking-tight">
              Hydration and Running
            </h1>
            <h2 className="text-2xl md:text-3xl text-muted-foreground font-medium mb-8">
              Improving Athletes' Hydration Experience
            </h2>
            <p className="text-lg md:text-xl text-foreground/80 leading-relaxed max-w-3xl mx-auto">
              A design research journey exploring how runners experience hydration, combining data, user interviews, 
              and prototyping to build a non-digital solution.
            </p>
            <div className="h-1 w-20 bg-accent mx-auto mt-8" />
          </div>
        </div>
      </header>

      {/* Main Content - Flipbooks Grid */}
      <main className="container mx-auto px-6 py-16 md:py-24">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-16">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">Design Process</h2>
            <p className="text-lg text-muted-foreground max-w-2xl mx-auto">
              Explore each phase of the design journey through interactive project deliverables
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-8 md:gap-12">
            {phases.map((phase, index) => (
              <div
                key={index}
                className="animate-fade-in"
                style={{ animationDelay: `${index * 0.1}s` }}
              >
                <div className="mb-6">
                  <div className="flex items-center gap-3 mb-3">
                    <span className="text-3xl font-bold text-accent">
                      {String(index + 1).padStart(2, '0')}
                    </span>
                    <h3 className="text-2xl font-bold">{phase.title}</h3>
                  </div>
                  <p className="text-sm text-muted-foreground leading-relaxed">
                    {phase.description}
                  </p>
                </div>
                <div className="flex justify-center">
                  <a
                    href={phase.flipbookLink}
                    className="fbo-embed rounded-lg overflow-hidden shadow-lg hover:shadow-xl transition-shadow"
                    data-fbo-id={phase.flipbookId}
                    data-fbo-ratio="3:2"
                    data-fbo-lightbox="yes"
                    data-fbo-width="100%"
                    data-fbo-height="auto"
                    data-fbo-version="1"
                    style={{ maxWidth: '100%' }}
                  >
                    {phase.title}
                  </a>
                </div>
              </div>
            ))}
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Designed by <span className="font-medium text-foreground">Abdelrahman Elmahmoudi</span>
            </p>
            <a 
              href="https://elmahmoudi.42web.io" 
              target="_blank" 
              rel="noopener noreferrer"
              className="inline-flex items-center gap-2 text-accent hover:underline transition-all"
            >
              Visit Portfolio
              <svg className="w-4 h-4" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14" />
              </svg>
            </a>
            <p className="text-xs text-muted-foreground mt-6 italic">
              "Feel free to take notes on me"
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
