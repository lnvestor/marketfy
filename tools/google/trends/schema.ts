import { JSONSchema7 } from 'json-schema';
import { jsonSchema } from 'ai';

import { GoogleTrendsDataType, GoogleTrendsPropertyFilter } from './types';

// Define the parameters interface
export interface GoogleTrendsParameters {
  q?: string;
  data_type?: GoogleTrendsDataType;
  geo?: string;
  hl?: string;
  region?: 'COUNTRY' | 'REGION' | 'DMA' | 'CITY';
  date?: string;
  tz?: string;
  cat?: string;
  gprop?: GoogleTrendsPropertyFilter;
  include_low_search_volume?: boolean;
}

// Create the JSON Schema definition
export const googleTrendsSchema: JSONSchema7 = {
  type: "object",
  properties: {
    q: {
      type: "string",
      description: "Query or comma-separated queries to search for in Google Trends. For multiple queries, separate with commas (e.g., \"coffee,tea,water\"). Maximum 5 queries for TIMESERIES and GEO_MAP. Only 1 query for other data types."
    },
    data_type: {
      type: "string",
      enum: ["TIMESERIES", "GEO_MAP", "GEO_MAP_0", "RELATED_TOPICS", "RELATED_QUERIES"],
      description: "Type of Google Trends data to retrieve:\n- TIMESERIES: Interest over time (default)\n- GEO_MAP: Compared breakdown by region\n- GEO_MAP_0: Interest by region\n- RELATED_TOPICS: Related topics\n- RELATED_QUERIES: Related queries"
    },
    geo: {
      type: "string",
      description: "Location to get trends data from. Defaults to worldwide. Examples: \"US\" (United States), \"GB\" (United Kingdom), \"FR\" (France)"
    },
    hl: {
      type: "string",
      description: "Language code for results. Examples: \"en\" (English), \"es\" (Spanish), \"fr\" (French)"
    },
    region: {
      type: "string",
      enum: ["COUNTRY", "REGION", "DMA", "CITY"],
      description: "Region type for GEO_MAP and GEO_MAP_0 data types:\n- COUNTRY: Country-level data\n- REGION: Subregion data\n- DMA: Metro area data\n- CITY: City data"
    },
    date: {
      type: "string",
      description: "Time range for data. Options:\n- \"now 1-H\": Past hour\n- \"now 4-H\": Past 4 hours\n- \"now 1-d\": Past day\n- \"now 7-d\": Past 7 days\n- \"today 1-m\": Past 30 days\n- \"today 3-m\": Past 90 days\n- \"today 12-m\": Past 12 months (default)\n- \"today 5-y\": Past 5 years\n- \"all\": 2004-present\nOr custom date range: \"yyyy-mm-dd yyyy-mm-dd\""
    },
    tz: {
      type: "string",
      description: "Timezone offset in minutes from UTC. Examples: \"420\" (PDT), \"-540\" (JST/Tokyo)"
    },
    cat: {
      type: "string",
      description: "Category ID to filter results. Default is 0 (all categories)"
    },
    gprop: {
      type: "string",
      enum: ["web", "images", "news", "froogle", "youtube"],
      description: "Property filter:\n- \"web\": Web Search (default)\n- \"images\": Image Search\n- \"news\": News Search\n- \"froogle\": Google Shopping\n- \"youtube\": YouTube Search"
    },
    include_low_search_volume: {
      type: "boolean",
      description: "Include regions with low search volume in GEO_MAP or GEO_MAP_0 results"
    }
  },
  required: []
} as const;

// Export the schema wrapped with jsonSchema helper
export const googleTrendsJsonSchema = jsonSchema<GoogleTrendsParameters>(googleTrendsSchema);