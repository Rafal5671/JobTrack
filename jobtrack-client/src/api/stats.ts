import client from "./client";
import type { ApiSuccess, StatsResult } from "../types";

// Fetch aggregated statistics for the authenticated user.
export const getStats = async (): Promise<StatsResult> => {
  const { data } = await client.get<ApiSuccess<StatsResult>>("/stats");
  return data.data;
};
