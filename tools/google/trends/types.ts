// Google Trends API response types
export interface GoogleTrendsApiResponse {
  search_metadata: {
    id: string;
    status: string;
    json_endpoint: string;
    created_at: string;
    processed_at: string;
    google_trends_url: string;
    raw_html_file: string;
    prettify_html_file: string;
    total_time_taken: number;
  };
  search_parameters: {
    engine: string;
    q?: string;
    date?: string;
    tz?: string;
    data_type?: string;
    geo?: string;
    hl?: string;
    cat?: string;
    gprop?: string;
    region?: string;
    include_low_search_volume?: string;
  };
  interest_over_time?: {
    timeline_data: Array<{
      date: string;
      timestamp: string;
      values: Array<{
        query?: string;
        value: string;
        extracted_value: number;
      }>;
    }>;
    averages?: Array<{
      query: string;
      value: number;
    }>;
  };
  compared_breakdown_by_region?: Array<{
    geo: string;
    location: string;
    max_value_index: number;
    values: Array<{
      query?: string;
      value: string;
      extracted_value: number;
    }>;
  }>;
  interest_by_region?: Array<{
    geo: string;
    location: string;
    max_value_index: number;
    value: string;
    extracted_value: number;
  }>;
  related_topics?: {
    rising: Array<{
      topic: {
        value: string;
        title: string;
        type: string;
      };
      value: string;
      extracted_value: number;
      link: string;
      serpapi_link: string;
    }>;
    top: Array<{
      topic: {
        value: string;
        title: string;
        type: string;
      };
      value: string;
      extracted_value: number;
      link: string;
      serpapi_link: string;
    }>;
  };
  related_queries?: {
    rising: Array<{
      query: string;
      value: string;
      extracted_value: number;
      link: string;
      serpapi_link: string;
    }>;
    top: Array<{
      query: string;
      value: string;
      extracted_value: number;
      link: string;
      serpapi_link: string;
    }>;
  };
}

// Configuration for Google Trends API
export interface GoogleTrendsConfig {
  apiKey: string | null;
  baseUrl: string;
}

// Google Trends data type options
export type GoogleTrendsDataType = 
  | 'TIMESERIES'      // Interest over time (default)
  | 'GEO_MAP'         // Compared breakdown by region
  | 'GEO_MAP_0'       // Interest by region
  | 'RELATED_TOPICS'  // Related topics
  | 'RELATED_QUERIES' // Related queries

// Google Trends property filter options
export type GoogleTrendsPropertyFilter =
  | 'web'             // Web Search (default, sent as empty string to API)
  | 'images'          // Image Search
  | 'news'            // News Search
  | 'froogle'         // Google Shopping
  | 'youtube'         // YouTube Search