from pydantic import BaseModel, Field
from typing import Optional


class PredictionInput(BaseModel):
    """Schema para dados de entrada da predição"""
    
    Return_1d: float = Field(..., description="Retorno em 1 dia")
    Return_5d: float = Field(..., description="Retorno em 5 dias")
    Return_10d: float = Field(..., description="Retorno em 10 dias")
    SMA_Cross_5_20: int = Field(..., description="Cruzamento SMA 5/20 (0 ou 1)")
    SMA_Cross_10_50: int = Field(..., description="Cruzamento SMA 10/50 (0 ou 1)")
    RSI_14: float = Field(..., description="RSI de 14 períodos", ge=0, le=100)
    BB_Position: float = Field(..., description="Posição nas Bandas de Bollinger")
    MACD_Diff: float = Field(..., description="Diferença MACD")
    Volume_Ratio: float = Field(..., description="Rácio de volume", gt=0)
    Volatility_5d: float = Field(..., description="Volatilidade 5 dias", ge=0)
    Volatility_20d: float = Field(..., description="Volatilidade 20 dias", ge=0)
    Daily_Range: float = Field(..., description="Range diário", ge=0)
    Daily_Range_MA: float = Field(..., description="Média móvel do range diário", ge=0)
    Trend: int = Field(..., description="Tendência (0 ou 1)")
    Noise: float = Field(..., description="Ruído do mercado", ge=0)
    Volatility: float = Field(..., description="Volatilidade geral", ge=0)

    class Config:
        json_schema_extra = {
            "example": {
                "Return_1d": 0.012,
                "Return_5d": 0.045,
                "Return_10d": 0.078,
                "SMA_Cross_5_20": 1,
                "SMA_Cross_10_50": 0,
                "RSI_14": 58.3,
                "BB_Position": 0.62,
                "MACD_Diff": 0.13,
                "Volume_Ratio": 1.2,
                "Volatility_5d": 0.012,
                "Volatility_20d": 0.015,
                "Daily_Range": 3.2,
                "Daily_Range_MA": 2.1,
                "Trend": 1,
                "Noise": 0.003,
                "Volatility": 0.012
            }
        }


class PredictionResponse(BaseModel):
    """Schema para resposta da predição"""
    
    prediction: int = Field(..., description="Predição (0=Desce, 1=Sobe)")
    prediction_label: str = Field(..., description="Label da predição")
    probability_up: float = Field(..., description="Probabilidade de subida")
    probability_down: float = Field(..., description="Probabilidade de descida")
    confidence: float = Field(..., description="Confiança da predição")