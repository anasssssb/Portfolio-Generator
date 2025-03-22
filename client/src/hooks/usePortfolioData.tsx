import { useMutation, useQuery } from "@tanstack/react-query";
import { apiRequest } from "@/lib/queryClient";
import { PortfolioData } from "@/types";

export const usePortfolioData = () => {
  // Query to fetch portfolio data by ID
  const getPortfolio = (id: number) => {
    return useQuery({
      queryKey: [`/api/portfolio/${id}`],
      enabled: !!id,
    });
  };

  // Mutation to create or update portfolio data
  const createPortfolio = useMutation({
    mutationFn: async (data: PortfolioData) => {
      const response = await apiRequest("POST", "/api/portfolio", data);
      return response.json();
    },
  });

  return { getPortfolio, createPortfolio };
};
