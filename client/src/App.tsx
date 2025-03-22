import { useState } from "react";
import { Switch, Route } from "wouter";
import { queryClient } from "./lib/queryClient";
import { QueryClientProvider } from "@tanstack/react-query";
import { Toaster } from "@/components/ui/toaster";
import NotFound from "@/pages/not-found";
import DataEntryPage from "@/pages/DataEntryPage";
import PortfolioPage from "@/pages/PortfolioPage";
import { PortfolioData } from "./types";
import DarkModeToggle from "./components/DarkModeToggle";

function Router() {
  const [portfolioData, setPortfolioData] = useState<PortfolioData | null>(null);
  const [portfolioId, setPortfolioId] = useState<number | null>(null);

  const handleDataSubmit = (data: PortfolioData, id: number) => {
    setPortfolioData(data);
    setPortfolioId(id);
  };

  return (
    <div className="min-h-screen">
      <DarkModeToggle />
      
      <Switch>
        <Route path="/">
          {portfolioData ? (
            <PortfolioPage data={portfolioData} portfolioId={portfolioId} />
          ) : (
            <DataEntryPage onDataSubmit={handleDataSubmit} />
          )}
        </Route>
        <Route component={NotFound} />
      </Switch>
    </div>
  );
}

function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <Router />
      <Toaster />
    </QueryClientProvider>
  );
}

export default App;
