import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { TooltipProvider } from "@/components/ui/tooltip";
import { VoterProvider } from "@/context/voter-context";
import { lazy, Suspense } from "react";
import { Loader2 } from "lucide-react";
import LandingPage from "@/pages/landing";
import AboutPage from "@/pages/about";
import ContactPage from "@/pages/contact";
import VotingBoothPage from "@/pages/voting-booth";
import ReceiptPage from "@/pages/receipt";
import NotFound from "@/pages/not-found";

const TechnologyPage = lazy(() => import("@/pages/technology"));
const AdminPage = lazy(() => import("@/pages/admin"));

import { useLocation } from "wouter";
import { useEffect } from "react";

function LazyFallback() {
  return (
    <div className="flex-grow flex items-center justify-center min-h-[50vh]">
      <div className="flex flex-col items-center gap-4 text-slate-500">
        <Loader2 className="w-10 h-10 animate-spin text-primary" />
        <p className="font-mono text-sm">Loading...</p>
      </div>
    </div>
  );
}

function Router() {
  const [location] = useLocation();

  useEffect(() => {
    console.log(`[DEBUG] [Router] CMS Navigation to: ${location}`);
  }, [location]);

  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/about" component={AboutPage} />
      <Route path="/technology">
        <Suspense fallback={<LazyFallback />}>
          <TechnologyPage />
        </Suspense>
      </Route>
      <Route path="/contact" component={ContactPage} />
      <Route path="/booth" component={VotingBoothPage} />
      <Route path="/receipt" component={ReceiptPage} />
      <Route path="/admin">
        <Suspense fallback={<LazyFallback />}>
          <AdminPage />
        </Suspense>
      </Route>
      <Route component={NotFound} />
    </Switch>
  );
}

function App() {
  useEffect(() => {
    console.log(`[DEBUG] [App] Sacred Vote CMS Root Initialized.`);
  }, []);

  return (
    <QueryClientProvider client={queryClient}>
      <TooltipProvider>
        <VoterProvider>
          <Toaster />
          <div aria-live="polite" aria-atomic="true" className="sr-only" id="vote-announcer" data-testid="vote-announcer" />
          <Router />
        </VoterProvider>
      </TooltipProvider>
    </QueryClientProvider>
  );
}

export default App;
