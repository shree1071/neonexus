import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import { FirebaseAuthProvider } from "./contexts/firebase-auth-context";
import { ThemeProvider } from "./contexts/theme-context";
import LandingPage from "@/pages/landing-page";
import OnboardingPage from "@/pages/onboarding";

function Router() {
  return (
    <Switch>
      <Route path="/" component={LandingPage} />
      <Route path="/onboarding" component={OnboardingPage} />
      <Route component={() => <div className="p-8 text-center font-sans">Page Not Found</div>} />
    </Switch>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider defaultTheme="system">
        <FirebaseAuthProvider>
          <Router />
          <Toaster />
        </FirebaseAuthProvider>
      </ThemeProvider>
    </QueryClientProvider>
  );
}

export default App;
