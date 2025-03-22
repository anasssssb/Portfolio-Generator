import { PortfolioData, Project } from "@/types";
import Navbar from "@/components/Navbar";
import HeroSection from "@/components/HeroSection";
import AboutSection from "@/components/AboutSection";
import ProjectsSection from "@/components/ProjectsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";
import { useToast } from "@/hooks/use-toast";
import { useMutation } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";

interface PortfolioPageProps {
  data: PortfolioData;
  portfolioId: number | null;
}

const PortfolioPage = ({ data, portfolioId }: PortfolioPageProps) => {
  const { toast } = useToast();

  // Handle project reordering
  const updatePortfolio = useMutation({
    mutationFn: async (updatedData: PortfolioData) => {
      const response = await apiRequest("POST", "/api/portfolio", updatedData);
      return response.json();
    },
    onError: (error) => {
      toast({
        title: "Error",
        description: `Failed to update projects order: ${error instanceof Error ? error.message : String(error)}`,
        variant: "destructive",
      });
    },
  });

  const handleProjectsReorder = (reorderedProjects: Project[]) => {
    // Update portfolio data with reordered projects
    const updatedData = {
      ...data,
      projects: reorderedProjects,
    };
    
    // Save the updated order to the server
    updatePortfolio.mutate(updatedData);
  };

  return (
    <div id="portfolioPage" className="font-sans antialiased bg-gray-50 dark:bg-gray-900 transition-all duration-300">
      <Navbar data={data} />
      <HeroSection data={data} />
      <AboutSection data={data} />
      <ProjectsSection data={data} onProjectsReorder={handleProjectsReorder} />
      <ContactSection portfolioId={portfolioId} />
      <Footer data={data} />
    </div>
  );
};

export default PortfolioPage;
