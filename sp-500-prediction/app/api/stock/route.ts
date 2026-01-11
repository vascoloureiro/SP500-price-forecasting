
import { NextResponse } from 'next/server';
import { PredictResponse, StockModelFeatures } from './Type/ModelResponseSP';

const URL_FAST_API = "http://localhost:8000";


export async function GET(request: Request) {
  const { searchParams } = new URL(request.url);
  const symbol = searchParams.get('symbol');

  if (!symbol) {
    return NextResponse.json({ error: 'Símbolo não fornecido' }, { status: 400 });
  }

  const apiKey = process.env.ALPHAVANTAGE_API_KEY;

  try {

    const response = await fetch(
      `https://www.alphavantage.co/query?function=TIME_SERIES_MONTHLY&symbol=${symbol}&apikey=${apiKey}`
    );

    const data = await response.json();

    if (data['Note']) {
      return NextResponse.json({ error: 'Limite de API atingido' }, { status: 429 });
    }

    if (data['Error Message']) {
      return NextResponse.json({ error: 'Símbolo inválido' }, { status: 400 });
    }

    return NextResponse.json(data);
  } catch (error) {
    return NextResponse.json({ error: 'Erro ao obter dados' }, { status: 500 });
  }
}

export async function retrivePrediction(data: StockModelFeatures ) {

  const request = await fetch(`${URL_FAST_API}/predict`, {
    method: 'POST',
    headers: {
      "Content-Type": "application/json" 
    },
    body: JSON.stringify({
      Return_1d: data.Return_1d,
      Return_5d: data.Return_5d,
      Return_10d: data.Return_10d,
      SMA_Cross_5_20: data.SMA_Cross_5_20,
      SMA_Cross_10_50: data.SMA_Cross_10_50,
      RSI_14: data.RSI_14,
      BB_Position: data.BB_Position,
      MACD_Diff: data.MACD_Diff,
      Volume_Ratio: data.Volume_Ratio,
      Volatility_5d: data.Volatility,
      Volatility_20d: data.Volatility_20d,
      Daily_Range: data.Daily_Range,
      Daily_Range_MA: data.Daily_Range_MA,
      Trend: data.Trend,
      Noise: data.Noise,
      Volatility: data.Volatility

    })
  });

  if(request){
    const data = await request.json()
    return data as PredictResponse;
  }
}