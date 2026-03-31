import { Link, useLocation } from "wouter";
import { ShieldCheck, Lock, Menu, X } from "lucide-react";
import { useEffect, useState, useRef } from "react";

function NavLink({ href, children, onClick }: { href: string; children: React.ReactNode; onClick?: () => void }) {
  const [location] = useLocation();
  const isActive = location === href;
  return (
    <Link
      href={href}
      onClick={onClick}
      className={`hover:text-primary transition-colors ${isActive ? "text-primary border-b-2 border-primary pb-0.5" : ""}`}
      aria-current={isActive ? "page" : undefined}
      data-testid={`nav-link-${href.replace("/", "") || "home"}`}
    >
      {children}
    </Link>
  );
}

interface LayoutProps {
  children: React.ReactNode;
  title?: string;
  description?: string;
}

export function Layout({ children, title, description }: LayoutProps) {
  const [location] = useLocation();
  const [isMobileMenuOpen, setIsMobileMenuOpen] = useState(false);
  const mainRef = useRef<HTMLElement>(null);
  const isFirstRender = useRef(true);

  useEffect(() => {
    const baseTitle = "SacredVote — Cryptographic Civic Verification";
    document.title = title ? `${title} | SacredVote` : baseTitle;

    let metaDescription = document.querySelector('meta[name="description"]');
    if (!metaDescription) {
      metaDescription = document.createElement('meta');
      metaDescription.setAttribute('name', 'description');
      document.head.appendChild(metaDescription);
    }
    metaDescription.setAttribute('content', description || "SacredVote is an engineering initiative focused on digital sovereignty and mathematical consensus verification.");

    const ogTags = [
      { property: 'og:title', content: title ? `${title} | SacredVote` : baseTitle },
      { property: 'og:description', content: description || "Cryptographic Civic Verification platform" },
      { property: 'og:type', content: 'website' },
      { property: 'og:site_name', content: 'SacredVote' }
    ];

    ogTags.forEach(tag => {
      let element = document.querySelector(`meta[property="${tag.property}"]`);
      if (!element) {
        element = document.createElement('meta');
        element.setAttribute('property', tag.property);
        document.head.appendChild(element);
      }
      element.setAttribute('content', tag.content);
    });
  }, [title, description]);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }
    // Scroll to top on route change (unless there's a hash anchor)
    if (!window.location.hash) {
      window.scrollTo(0, 0);
    }
    mainRef.current?.focus({ preventScroll: false });
  }, [location]);

  const getMobileLinkClass = (path: string) => {
    const isActive = location === path;
    return `block px-4 py-3 transition-colors ${
      isActive 
        ? "text-primary font-bold bg-slate-50 border-l-4 border-primary" 
        : "text-slate-500 hover:text-primary hover:bg-slate-50 border-l-4 border-transparent"
    }`;
  };

  return (
    <div className="min-h-screen bg-white flex flex-col font-sans text-slate-800">
      <a
        href="#main-content"
        className="sr-only focus:not-sr-only focus:absolute focus:top-2 focus:left-2 focus:z-[100] focus:bg-primary focus:text-white focus:px-4 focus:py-2 focus:rounded-md focus:text-sm focus:font-semibold"
        data-testid="skip-to-main"
      >
        Skip to main content
      </a>

      {/* Institutional Header */}
      <header role="banner" className="bg-white border-b border-slate-200 shadow-sm z-50 sticky top-0">
        <div className="max-w-5xl mx-auto px-6 h-20 flex items-center justify-between">
          <Link href="/" className="flex items-center gap-3 group cursor-pointer" data-testid="link-home">
            <div className="w-10 h-10 bg-primary rounded-lg flex items-center justify-center shadow-md group-hover:scale-105 transition-transform duration-200">
              <ShieldCheck className="w-6 h-6 text-white" aria-hidden="true" />
            </div>
            <div className="flex flex-col">
              <h1 className="text-2xl font-serif font-bold text-primary leading-tight tracking-tight">
                SacredVote
              </h1>
              <span className="text-[10px] uppercase tracking-[0.2em] text-slate-400 font-bold">
                Verification Matrix
              </span>
            </div>
          </Link>
          
          <nav role="navigation" aria-label="Main navigation" className="hidden md:flex items-center gap-8 text-xs font-bold uppercase tracking-widest text-slate-500">
            <NavLink href="/about">About</NavLink>
            <NavLink href="/technology">Technology</NavLink>
            <NavLink href="/contact">Contact</NavLink>
            <div className="flex items-center gap-2 px-3 py-1.5 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs font-bold uppercase tracking-widest shadow-sm" data-testid="status-secure" aria-label="Connection is secure">
              <Lock className="w-3 h-3" aria-hidden="true" />
              Secure
              <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse ml-1"></span>
            </div>

            {/* Mobile menu button */}
            <button 
              className="md:hidden p-2 text-slate-500 hover:text-primary transition-colors"
              onClick={() => setIsMobileMenuOpen(!isMobileMenuOpen)}
              aria-label="Toggle menu"
            >
              {isMobileMenuOpen ? <X className="w-6 h-6" /> : <Menu className="w-6 h-6" />}
            </button>
          </nav>
        </div>

        {/* Mobile menu panel */}
        {isMobileMenuOpen && (
          <div className="md:hidden bg-white border-t border-slate-100 shadow-lg absolute w-full left-0">
            <nav className="flex flex-col py-2 text-sm font-bold uppercase tracking-widest">
              <NavLink href="/about" onClick={() => setIsMobileMenuOpen(false)}>
                <div className={getMobileLinkClass("/about")}>About</div>
              </NavLink>
              <NavLink href="/technology" onClick={() => setIsMobileMenuOpen(false)}>
                <div className={getMobileLinkClass("/technology")}>Technology</div>
              </NavLink>
              <NavLink href="/contact" onClick={() => setIsMobileMenuOpen(false)}>
                <div className={getMobileLinkClass("/contact")}>Contact</div>
              </NavLink>
              <div className="mx-4 my-2 flex items-center gap-2 px-3 py-2 rounded-md bg-emerald-50 border border-emerald-200 text-emerald-700 text-xs shadow-sm w-max">
                <Lock className="w-3 h-3" />
                Secure
                <span className="w-2 h-2 bg-emerald-500 rounded-full animate-pulse ml-1"></span>
              </div>
            </nav>
          </div>
        )}
      </header>

      <main id="main-content" role="main" className="flex-grow flex flex-col" ref={mainRef} tabIndex={-1} style={{ outline: "none" }}>
        {children}
      </main>

      {/* Institutional Footer */}
      <footer role="contentinfo" className="bg-gradient-to-b from-white to-slate-50 border-t border-slate-200 pt-16 pb-8">
        <div className="max-w-5xl mx-auto px-6">
          <div className="grid md:grid-cols-3 gap-12 items-start mb-16">
            {/* Column 1 */}
            <div>
              <div className="flex items-center gap-2 mb-4">
                <ShieldCheck className="w-6 h-6 text-primary" aria-hidden="true" />
                <span className="font-serif font-bold text-xl text-primary">SacredVote</span>
              </div>
              <p className="text-sm text-slate-500 leading-relaxed max-w-sm">
                SacredVote is an engineering initiative focused on digital sovereignty and mathematical consensus verification.
              </p>
            </div>
            
            {/* Column 2 */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Quick Links</h3>
              <ul className="flex flex-col gap-3 text-sm text-slate-600 font-medium">
                <li><a href="/about" className="hover:text-primary transition-colors">About</a></li>
                <li><a href="/technology" className="hover:text-primary transition-colors">Technology</a></li>
                <li><a href="/contact" className="hover:text-primary transition-colors">Contact</a></li>
              </ul>
            </div>
            {/* Column 3 */}
            <div>
              <h3 className="text-xs font-bold uppercase tracking-widest text-slate-400 mb-4">Platform</h3>
              <ul className="flex flex-col gap-3 text-sm text-slate-600 font-medium">
                <li><a href="/technology#section-1" className="hover:text-primary transition-colors">Cryptographic Infrastructure</a></li>
                <li><a href="/technology#section-15" className="hover:text-primary transition-colors">Zero-Trust Architecture</a></li>
                <li><a href="/technology#section-8" className="hover:text-primary transition-colors">Formal Verification</a></li>
              </ul>
            </div>
          </div>
          <div className="pt-8 border-t border-slate-200 flex flex-col lg:flex-row justify-between items-center gap-6">
            <p className="text-[10px] text-slate-400 uppercase tracking-widest font-bold">
              © 2026 SacredVote Initiative • FOSS Infrastructure
            </p>
            <div className="text-[10px] font-mono text-slate-400 tracking-wider text-center">
              PROTOCOL: ZERO-TRUST • CERT: FIPS-140-3
            </div>
            <div className="text-[10px] text-slate-400 uppercase tracking-widest font-bold flex items-center gap-2">
              Engineered by 
              <a 
                href="https://PlausiDen.com" 
                target="_blank" 
                rel="noopener noreferrer"
                className="text-primary hover:underline transition-all duration-200 flex items-center gap-1"
                data-testid="link-plausiden"
              >
                PlausiDen
              </a>
            </div>
          </div>
        </div>
      </footer>
    </div>
  );
}
