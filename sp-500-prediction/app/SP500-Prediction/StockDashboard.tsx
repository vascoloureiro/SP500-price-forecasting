'use client';

import { useState, useEffect } from 'react';
import {
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  ResponsiveContainer
} from 'recharts';
import { TrendingUp, TrendingDown, Activity } from 'lucide-react';
import { retrivePrediction } from '../api/stock/route';
import { StockModelFeatures } from '../api/stock/Type/ModelResponseSP';

const AVAILABLE_STOCKS = [
  { label: 'Apple', symbol: 'AAPL' },
  { label: 'Microsoft', symbol: 'MSFT' },
  { label: 'Google', symbol: 'GOOGL' },
  { label: 'Amazon', symbol: 'AMZN' },
  { label: 'Tesla', symbol: 'TSLA' },
];

const StockDashboard = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [symbol, setSymbol] = useState('AAPL');
  const [stockData, setStockData] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [prediction, setPrediction] = useState<any>(null);
  const [currentPrice, setCurrentPrice] = useState<string | null>(null);
  const [predicting, setPredicting] = useState(false);
  const [decompositionData, setDecompositionData] = useState<any>(null);
  const [loadingDecomposition, setLoadingDecomposition] = useState(false);

  const fetchStockData = async () => {
    setLoading(true);
    setPrediction(null);
    setDecompositionData(null);

    try {
      const response = await fetch(`/api/stock?symbol=${symbol}`);
      const data = await response.json();

      const timeSeries = data['Monthly Time Series'];

      if (!timeSeries) {
        throw new Error(data.error || 'Dados não encontrados');
      }

      const fiveYearsAgo = new Date();
      fiveYearsAgo.setFullYear(fiveYearsAgo.getFullYear() - 5);

      const filteredData = Object.entries(timeSeries)
        .map(([date, values]: any) => ({
          dateObj: new Date(date),
          price: Number(values['4. close']),
          displayDate: date
        }))
        .filter(item => item.dateObj >= fiveYearsAgo)
        .sort((a, b) => a.dateObj.getTime() - b.dateObj.getTime())
        .map(item => ({
          date: item.dateObj.toLocaleDateString('pt-PT', {
            month: 'short',
            year: '2-digit',
          }),
          price: item.price,
        }));

      setStockData(filteredData);
      setCurrentPrice(filteredData.at(-1)?.price.toFixed(2) || null);

    } catch (error: any) {
      console.error('Erro:', error);
      alert(error.message);
    } finally {
      setLoading(false);
    }
  };

  const fetchDecomposition = async () => {
    setLoadingDecomposition(true);
    try {
      const response = await fetch(`/stock/decomposition?symbol=${symbol}`);
      const data = await response.json();
      
      if (data.error) {
        throw new Error(data.error);
      }

      setDecompositionData(data);
    } catch (error: any) {
      console.error('Erro ao carregar decomposição:', error);
      alert(error.message);
    } finally {
      setLoadingDecomposition(false);
    }
  };

  const prepareModelFeatures = (data: any[]) => {
    if (data.length < 50) return null;

    const prices = data.map(d => d.price);
    const n = prices.length;

    const Return_1d = (prices[n - 1] - prices[n - 2]) / prices[n - 2];
    const Return_5d = (prices[n - 1] - prices[n - 6]) / prices[n - 6];
    const Return_10d = (prices[n - 1] - prices[n - 11]) / prices[n - 11];

    const sma5 = prices.slice(-5).reduce((a, b) => a + b, 0) / 5;
    const sma20 = prices.slice(-20).reduce((a, b) => a + b, 0) / 20;
    const sma10 = prices.slice(-10).reduce((a, b) => a + b, 0) / 10;
    const sma50 = prices.slice(-50).reduce((a, b) => a + b, 0) / 50;

    const SMA_Cross_5_20 = sma5 > sma20 ? 1 : 0;
    const SMA_Cross_10_50 = sma10 > sma50 ? 1 : 0;

    const calculateRSI = (prices: number[], period: number = 14) => {
      const changes = [];
      for (let i = 1; i < prices.length; i++) {
        changes.push(prices[i] - prices[i - 1]);
      }
      const recentChanges = changes.slice(-period);
      const gains = recentChanges.filter(c => c > 0).reduce((a, b) => a + b, 0) / period;
      const losses = Math.abs(recentChanges.filter(c => c < 0).reduce((a, b) => a + b, 0)) / period;
      const rs = gains / (losses || 0.0001);
      return 100 - (100 / (1 + rs));
    };
    const RSI_14 = calculateRSI(prices);

    const stdDev20 = Math.sqrt(
      prices.slice(-20).reduce((sum, p) => sum + Math.pow(p - sma20, 2), 0) / 20
    );
    const upperBB = sma20 + 2 * stdDev20;
    const lowerBB = sma20 - 2 * stdDev20;
    const BB_Position = (prices[n - 1] - lowerBB) / (upperBB - lowerBB);

    const ema = (data: number[], period: number) => {
      const k = 2 / (period + 1);
      let emaVal = data[0];
      for (let i = 1; i < data.length; i++) {
        emaVal = data[i] * k + emaVal * (1 - k);
      }
      return emaVal;
    };
    const ema12 = ema(prices.slice(-26), 12);
    const ema26 = ema(prices.slice(-26), 26);
    const macdLine = ema12 - ema26;
    const MACD_Diff = macdLine / prices[n - 1];

    const calculateVolatility = (prices: number[], period: number) => {
      const returns = [];
      for (let i = 1; i <= period && i < prices.length; i++) {
        returns.push((prices[prices.length - i] - prices[prices.length - i - 1]) / prices[prices.length - i - 1]);
      }
      const mean = returns.reduce((a, b) => a + b, 0) / returns.length;
      const variance = returns.reduce((sum, r) => sum + Math.pow(r - mean, 2), 0) / returns.length;
      return Math.sqrt(variance);
    };

    const Volatility_5d = calculateVolatility(prices, 5);
    const Volatility_20d = calculateVolatility(prices, 20);
    const Volatility = Volatility_20d;

    const ranges = [];
    for (let i = Math.max(0, n - 20); i < n; i++) {
      ranges.push(Math.abs(prices[i] - (prices[i - 1] || prices[i])) / prices[i] * 100);
    }
    const Daily_Range = ranges[ranges.length - 1] || 0;
    const Daily_Range_MA = ranges.reduce((a, b) => a + b, 0) / ranges.length;

    const recentPrices = prices.slice(-20);
    const xMean = 9.5;
    const yMean = recentPrices.reduce((a, b) => a + b, 0) / recentPrices.length;
    let numerator = 0;
    let denominator = 0;
    for (let i = 0; i < recentPrices.length; i++) {
      numerator += (i - xMean) * (recentPrices[i] - yMean);
      denominator += Math.pow(i - xMean, 2);
    }
    const slope = numerator / denominator;
    const Trend = slope > 0 ? 1 : 0;

    const Noise = Volatility_5d / (Volatility_20d || 0.0001);
    const Volume_Ratio = 1.0;

    return {
      Return_1d,
      Return_5d,
      Return_10d,
      SMA_Cross_5_20,
      SMA_Cross_10_50,
      RSI_14,
      BB_Position,
      MACD_Diff,
      Volume_Ratio,
      Volatility_5d,
      Volatility_20d,
      Daily_Range,
      Daily_Range_MA,
      Trend,
      Noise,
      Volatility
    } as StockModelFeatures;
  };

  const predictTrend = async () => {
    if (stockData.length < 20) {
      alert('Dados insuficientes para análise técnica (mínimo 20 meses)');
      return;
    }

    setPredicting(true);

    try {
      const features = prepareModelFeatures(stockData);

      if(!features){
        alert('Erro ao gerar Dados');
        return;
      } 

      const result = await retrivePrediction(features);

      const probabilityUp = result?.probability_up || 0;
      const isUpTrend = probabilityUp > 0.5;

      const predictionStartIndex = Math.floor(stockData.length * 0.8);
      const lastPrice = stockData[stockData.length - 1].price;
      const firstPredictionPrice = stockData[predictionStartIndex].price;
      
      const priceChange = isUpTrend 
        ? lastPrice * (probabilityUp - 0.5) * 0.3
        : lastPrice * (0.5 - probabilityUp) * -0.3;
      
      const updatedData = stockData.map((item, index) => {
        if (index >= predictionStartIndex) {
          const progress = (index - predictionStartIndex) / (stockData.length - predictionStartIndex);
          const predictionPrice = firstPredictionPrice + (priceChange * progress);
          return { ...item, prediction: predictionPrice };
        }
        return item;
      });

      setStockData(updatedData);

      setPrediction({
        trend: result?.prediction,
        probabilityUp: result?.probability_up || "0.00",
        probabilityDown: result?.probability_down || "0.00",
        predictionLabel: result?.prediction_label || "Erro",
        confidence: ((result?.confidence || 0) * 100).toFixed(0),
      });

    } catch (error) {
      console.error('Erro na predição:', error);
    } finally {
      setPredicting(false);
    }
  };

  useEffect(() => {
    fetchStockData();
  }, []);

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-[1600px] mx-auto flex flex-col gap-8">

        {/* Header */}
        <div className="flex flex-col gap-5">
          <img
            src="/reports/images/sp500.jpg"
            alt="S&P 500"
            className="w-full max-h-82 object-cover rounded-xl shadow-md"
          />

          <h1 className="text-4xl md:text-5xl font-bold text-slate-800 tracking-tight py-5">
            Stock Market Prediction
          </h1>

          <h3 className="text-slate-500 text-sm uppercase tracking-widest">
            Machine Learning • Time Series Analysis
          </h3>

          <p className="text-slate-700 text-lg max-w-3xl">
            Visualize o histórico de preços de ativos financeiros e obtenha previsões
            baseadas em modelos de <strong>Machine Learning</strong> treinados sobre
            dados históricos. Selecione uma ação abaixo para iniciar a análise.
          </p>
        </div>

        {/* Seletor de ações */}
        <div className="flex gap-4 items-center w-full max-w-md">
          <div className="relative flex-1">
            <button
              type="button"
              onClick={(e) => { e.stopPropagation(); setIsOpen(!isOpen); }}
              className="w-full px-4 py-3 bg-white border border-gray-300 rounded-xl flex justify-between items-center shadow-sm hover:shadow-md focus:outline-none focus:ring-2 focus:ring-blue-400 transition"
            >
              <span className="text-slate-900 font-medium">
                {AVAILABLE_STOCKS.find(s => s.symbol === symbol)?.label || symbol}
              </span>
              <svg
                className={`w-5 h-5 text-slate-500 transition-transform ${isOpen ? 'rotate-180' : ''}`}
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
              >
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 9l-7 7-7-7" />
              </svg>
            </button>

            {isOpen && (
              <div className="absolute z-30 mt-2 w-full bg-white border border-gray-200 rounded-xl shadow-lg overflow-hidden">
                {AVAILABLE_STOCKS.map(stock => (
                  <button
                    key={stock.symbol}
                    onClick={() => { setSymbol(stock.symbol); setIsOpen(false); }}
                    className="w-full px-4 py-2 text-left hover:bg-blue-50 transition flex justify-between"
                  >
                    <span className="font-medium text-slate-900">{stock.label}</span>
                    <span className="ml-2 text-sm text-slate-500">({stock.symbol})</span>
                  </button>
                ))}
              </div>
            )}
          </div>

          <button
            onClick={fetchStockData}
            disabled={loading}
            className="px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 shadow-sm transition"
          >
            {loading ? 'Carregando...' : 'Analisar'}
          </button>
        </div>

        <div className="flex flex-col lg:flex-row gap-4 flex-1">
          {/* Gráfico Principal */}
          <div className="min-h-[80dvh] flex-1 bg-white rounded-2xl shadow-md p-6 flex flex-col">
            <h2 className="text-xl font-semibold mb-4 text-slate-900 tracking-wide">
              Histórico de Preços — {symbol} (Últimos 5 Anos)
            </h2>
            <div className="flex-1 min-h-0">
              {stockData.length > 0 ? (
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={stockData}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis
                      dataKey="date"
                      angle={-45}
                      textAnchor="end"
                      height={80}
                      interval="preserveStartEnd"
                      tick={{ fill: '#374151', fontSize: 12 }}
                    />
                    <YAxis tick={{ fill: '#374151' }} />
                    <Tooltip contentStyle={{ backgroundColor: '#fff', borderRadius: 8, borderColor: '#e5e7eb' }} />
                    <Legend wrapperStyle={{ color: '#374151' }} />
                    <Line type="monotone" dataKey="price" stroke="#2563eb" strokeWidth={3} dot={false} name="Preço" />
                    {prediction && (
                      <Line 
                        type="monotone" 
                        dataKey="prediction" 
                        stroke={prediction.probabilityUp > 0.5 ? "#10b981" : "#ef4444"} 
                        strokeWidth={3} 
                        strokeDasharray="8 4"
                        dot={false}
                        name={prediction.probabilityUp > 0.5 ? "Tendência de Alta" : "Tendência de Baixa"}
                      />
                    )}
                  </LineChart>
                </ResponsiveContainer>
              ) : (
                <div className="h-full flex items-center justify-center text-slate-400">
                  <Activity size={48} />
                </div>
              )}
            </div>
          </div>

          {/* Painel de Análise */}
          <div className="w-full lg:w-[30%] bg-white rounded-2xl shadow-md p-6 flex flex-col gap-4">
            <h2 className="text-xl font-semibold text-slate-900 tracking-wide">
              Análise Preditiva
            </h2>

            {currentPrice && (
              <div className="p-4 bg-blue-50 rounded-xl shadow-sm">
                <p className="text-sm text-slate-700">Preço Atual</p>
                <p className="text-3xl font-bold text-blue-600">${currentPrice}</p>
              </div>
            )}

            {prediction ? (
              <div className={`p-5 rounded-xl border ${prediction.probabilityUp > 0.5 ? 'bg-green-50 border-green-200' : 'bg-red-50 border-red-200'} shadow-sm`}>
                <div className="flex items-center gap-2 mb-3">
                  {prediction.probabilityUp > 0.5 ? (
                    <TrendingUp className="text-green-600" />
                  ) : (
                    <TrendingDown className="text-red-600" />
                  )}
                  <span className="text-lg font-semibold text-slate-900">
                    Tendência {prediction.predictionLabel}
                  </span>
                </div>

                <div className="space-y-2 text-sm text-slate-700">
                  <p>Probabilidade de Subida: <span className="font-semibold">{prediction.probabilityUp}%</span></p>
                  <p>Probabilidade de Descida: <span className="font-semibold">{prediction.probabilityDown}%</span></p>                  
                  <p>Confiança: <span className="font-semibold">{prediction.confidence}%</span></p>
                </div>
              </div>
            ) : (
              <div className="flex-1 flex flex-col items-center justify-center text-slate-400">
                <Activity size={48} className="mb-3" />
                <p className="text-center">Carregue dados para ver a previsão</p>
              </div>
            )}

            <button
              onClick={predictTrend}
              disabled={predicting || stockData.length === 0}
              className='px-6 py-3 bg-blue-600 text-white rounded-xl font-semibold hover:bg-blue-700 disabled:bg-gray-400 shadow-sm transition'
            >
              {predicting ? 'Prevendo...' : 'Prever'}
            </button>

            <button
              onClick={fetchDecomposition}
              disabled={loadingDecomposition || stockData.length === 0}
              className='px-6 py-3 bg-purple-600 text-white rounded-xl font-semibold hover:bg-purple-700 disabled:bg-gray-400 shadow-sm transition'
            >
              {loadingDecomposition ? 'Carregando...' : 'Decomposição do Sinal'}
            </button>
          </div>
        </div>

        {/* Gráficos de Decomposição */}
        {decompositionData && (
          <div className="bg-white rounded-2xl shadow-md p-6">
            <h2 className="text-2xl font-bold text-slate-900 mb-6">
              {symbol} — Decomposição do Sinal Financeiro
            </h2>

            <div className="space-y-6">
              {/* Preço Original + Tendência */}
              <div className="h-64">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Preço Original vs Tendência (MA20)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={decompositionData.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="close" stroke="#2563eb" name="Preço Original" strokeWidth={2} dot={false} />
                    <Line type="monotone" dataKey="trend" stroke="#dc2626" name="Tendência (MA20)" strokeWidth={3} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Ruído */}
              <div className="h-64">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Ruído (Desvio da Tendência)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={decompositionData.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="noise" stroke="#10b981" name="Ruído ($)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>

              {/* Volatilidade */}
              <div className="h-64">
                <h3 className="text-lg font-semibold text-slate-800 mb-3">Volatilidade (20 dias)</h3>
                <ResponsiveContainer width="100%" height="100%">
                  <LineChart data={decompositionData.data}>
                    <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                    <XAxis 
                      dataKey="date" 
                      angle={-45} 
                      textAnchor="end" 
                      height={60}
                      tick={{ fontSize: 11 }}
                    />
                    <YAxis tick={{ fontSize: 11 }} />
                    <Tooltip />
                    <Legend />
                    <Line type="monotone" dataKey="volatility" stroke="#f97316" name="Volatilidade (%)" strokeWidth={2} dot={false} />
                  </LineChart>
                </ResponsiveContainer>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default StockDashboard;