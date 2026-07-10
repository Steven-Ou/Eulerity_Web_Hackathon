// src/types/index.ts

export interface SummaryMetrics {
  date: string;
  impressions: number;
  clicks: number;
  spend: number;
  conversions: number;
}

export interface DailyMetrics extends SummaryMetrics {
  ctr: number;
  cpc: number;
  cpm: number;
}

export interface FacebookDailyMetrics extends DailyMetrics {
  reach: number;
  likes: number;
  comments: number;
  shares: number;
}

export interface InstagramDailyMetrics extends DailyMetrics {
  reach: number;
  likes: number;
  comments: number;
  saves: number;
}

export interface GoogleDailyMetrics extends DailyMetrics {
  costPerConversion: number;
}

export interface LinkedInDailyMetrics extends DailyMetrics {
  likes: number;
  comments: number;
  shares: number;
  follows: number;
}

// Custom error interface based on the API docs
export interface ApiError {
  error: string;
  message: string;
}