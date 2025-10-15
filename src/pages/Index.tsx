import { useEffect } from "react";

const Index = () => {
  const phases = [
    {
      title: "User Interviews",
      description: "Insights from 7 runners on hydration habits, struggles, and needs. Reveals key pain points that shaped the entire design process.",
      flipbookLink: "https://online.flippingbook.com/view/444041480/",
      flipbookId: "XXXXXXXX"
    },
    {
      title: "Analytics",
      description: "Scientific data validating how dehydration impacts performance. Links research with real athlete experiences.",
      flipbookLink: "https://online.flippingbook.com/view/226763932/",
      flipbookId: "XXXXXXXX"
    },
    {
      title: "Persona (Pierre)",
      description: "Meet Pierre — a 32-year-old runner who struggles to stay hydrated. Represents all user insights in one realistic profile.",
      flipbookLink: "https://online.flippingbook.com/view/227172098/",
      flipbookId: "XXXXXXXX"
    },
    {
      title: "User Journey",
      description: "Pierre's full race experience — before, during, and after running. Highlights his emotions, actions, and hydration pain points.",
      flipbookLink: "https://online.flippingbook.com/view/227209006/",
      flipbookId: "XXXXXXXX"
    },
    {
      title: "Problem Statement",
      description: "Defines the main challenge through one key question: 'How might we help Pierre stay hydrated using a simple, non-digital tool?'",
      flipbookLink: "https://online.flippingbook.com/view/227270498/",
      flipbookId: "XXXXXXXX"
    },
    {
      title: "Ideation",
      description: "Brainstormed multiple ideas and chose The Hydration Band, a color-based, non-digital reminder for hydration timing.",
      flipbookLink: "https://online.flippingbook.com/view/226945071/",
      flipbookId: "XXXXXXXX"
    },
    {
      title: "Storyboard (Prototyping)",
      description: "Six hand-drawn scenes showing Pierre using the Hydration Band before, during, and after the race.",
      flipbookLink: "https://online.flippingbook.com/view/227027871/",
      flipbookId: "XXXXXXXX"
    },
    {
      title: "Final Product (Sweat-Reactive Hydration Band)",
      description: "The final concept: a sweat-reactive wristband that changes color to remind athletes when to hydrate — simple, smart, human.",
      flipbookLink: "https://online.flippingbook.com/view/226512262/",
      flipbookId: "XXXXXXXX",
      isFinal: true
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
        {/* GitHub Icon */}
        <div className="flex justify-center py-4">
          <a
            href="https://github.com/abdel-mars"
            target="_blank"
            rel="noopener noreferrer"
            className="inline-block p-2 rounded-full transition-all duration-300 hover:scale-110 hover:shadow-2xl hover:shadow-accent/50 hover:drop-shadow-[0_0_20px_rgba(59,130,246,0.8)] cursor-pointer z-10"
          >
            <svg
              className="w-8 h-8 text-foreground hover:text-accent transition-colors duration-300"
              fill="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path d="M12 0c-6.626 0-12 5.373-12 12 0 5.302 3.438 9.8 8.207 11.387.599.111.793-.261.793-.577v-2.234c-3.338.726-4.033-1.416-4.033-1.416-.546-1.387-1.333-1.756-1.333-1.756-1.089-.745.083-.729.083-.729 1.205.084 1.839 1.237 1.839 1.237 1.07 1.834 2.807 1.304 3.492.997.107-.775.418-1.305.762-1.604-2.665-.305-5.467-1.334-5.467-5.931 0-1.311.469-2.381 1.236-3.221-.124-.303-.535-1.524.117-3.176 0 0 1.008-.322 3.301 1.23.957-.266 1.983-.399 3.003-.404 1.02.005 2.047.138 3.006.404 2.291-1.552 3.297-1.23 3.297-1.23.653 1.653.242 2.874.118 3.176.77.84 1.235 1.911 1.235 3.221 0 4.609-2.807 5.624-5.479 5.921.43.372.823 1.102.823 2.222v3.293c0 .319.192.694.801.576 4.765-1.589 8.199-6.086 8.199-11.386 0-6.627-5.373-12-12-12z"/>
            </svg>
          </a>
        </div>
        <div className="container mx-auto px-6 py-16 md:py-24 relative">
          <div className="max-w-4xl mx-auto text-center animate-fade-in">
            <div className="inline-block mb-4">
              <div className="h-1 w-20 bg-accent mx-auto mb-6" />
            </div>
            <img src="/img/logoWhite.png" alt="Logo" className="w-50 h-40 mx-auto mb-4" />
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
            {phases.slice(0, 7).map((phase, index) => (
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

          {/* Final Product - Highlighted Section */}
          <div className="mt-16 animate-fade-in" style={{ animationDelay: '0.7s' }}>
            <div className="max-w-5xl mx-auto">
              <div className="border-2 border-accent rounded-xl p-8 md:p-12 bg-accent/5">
                <div className="mb-8">
                  <div className="flex items-center gap-4 mb-4">
                    <span className="text-5xl font-bold text-accent">08</span>
                    <h3 className="text-3xl md:text-4xl font-bold">{phases[7].title}</h3>
                  </div>
                  <p className="text-base md:text-lg text-foreground/90 leading-relaxed max-w-3xl">
                    {phases[7].description}
                  </p>
                </div>
                <div className="flex justify-center">
                  <a
                    href={phases[7].flipbookLink}
                    className="fbo-embed rounded-lg overflow-hidden shadow-xl hover:shadow-2xl transition-shadow"
                    data-fbo-id={phases[7].flipbookId}
                    data-fbo-ratio="3:2"
                    data-fbo-lightbox="yes"
                    data-fbo-width="100%"
                    data-fbo-height="auto"
                    data-fbo-version="1"
                    style={{ maxWidth: '100%' }}
                  >
                    {phases[7].title}
                  </a>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>

      {/* Footer */}
      <footer className="border-t border-border mt-24">
        <div className="container mx-auto px-6 py-12">
          <div className="max-w-4xl mx-auto text-center">
            <p className="text-sm text-muted-foreground mb-3">
              Designed by <span className="font-medium text-foreground">Mars</span>
            </p>
            <a 
              href="http://elmahmoudi.42web.io" 
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
              "Start small, scale fast."
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};

export default Index;
