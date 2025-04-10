export interface PerplexityMessage {
  role: string;
  content: string;
}

export interface PerplexityParameters {
  messages: PerplexityMessage[];
}

// API response interfaces
export interface PerplexityCitation {
  start: number;
  end: number;
  text: string;
  url: string;
}

export interface PerplexityChoice {
  message: {
    role: string;
    content: string;
  };
  finish_reason: string;
  index: number;
}

export interface PerplexityResponse {
  id: string;
  choices: PerplexityChoice[];
  created: number;
  model: string;
  citations?: PerplexityCitation[];
}