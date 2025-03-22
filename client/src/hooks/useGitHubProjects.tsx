import { useQuery } from "@tanstack/react-query";
import { Project } from "@/types";
import { apiRequest } from "@/lib/queryClient";

interface GitHubProfile {
  login: string;
  avatar_url: string;
  html_url: string;
  name: string;
  bio: string;
  blog: string;
  location: string;
  email: string;
}

interface GitHubResponse {
  githubProfile: GitHubProfile;
  projects: Project[];
}

export function useGitHubProjects(username: string) {
  return useQuery<GitHubResponse>({
    queryKey: ['/api/github', username],
    queryFn: async () => {
      if (!username) {
        return { githubProfile: {} as GitHubProfile, projects: [] };
      }
      
      const response = await apiRequest("GET", `/api/github/${username}`);
      return response.json();
    },
    enabled: !!username,
    staleTime: 1000 * 60 * 5, // 5 minutes
  });
}