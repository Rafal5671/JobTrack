import { useQuery } from "@tanstack/react-query";
import { getStats } from "../api/stats";

// Fetch aggregated statistics for the authenticated user.
export const useStats = () => {
  return useQuery({
    queryKey: ["stats"],
    queryFn: getStats,
  });
};
