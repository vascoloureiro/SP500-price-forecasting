
export interface StockModelFeatures {
  Return_1d: number;
  Return_5d: number;
  Return_10d: number;
  SMA_Cross_5_20: number; 
  SMA_Cross_10_50: number;
  RSI_14: number;
  BB_Position: number;
  MACD_Diff: number;
  Volume_Ratio: number;
  Volatility_5d: number;
  Volatility_20d: number;
  Daily_Range: number;
  Daily_Range_MA: number;
  Trend: number; 
  Noise: number;
  Volatility: number;
}

export interface PredictRequest {
  symbol: string;
  features: StockModelFeatures;
}

// Representa a resposta que vem da sua API Python
export interface PredictResponse {
  prediction: number;
  prediction_label: string;      
  probability_up: number;
  probability_down:number    
  confidence: number;            
}

