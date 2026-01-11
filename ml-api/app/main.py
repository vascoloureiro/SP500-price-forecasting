from fastapi import FastAPI, HTTPException
from flask import jsonify, request
from fastapi.middleware.cors import CORSMiddleware
import joblib
import json
import pandas as pd
import numpy as np
from pathlib import Path
import os

from schemas import PredictionInput

# Obter o diretório base do projeto
BASE_DIR = Path(__file__).resolve().parent.parent
MODELS_DIR = BASE_DIR / "models"

# Caminhos dos ficheiros do modelo
MODEL_PATH = MODELS_DIR / "rf_binary_classifier_20260111_004550.pkl"
SCALER_PATH = MODELS_DIR / "scaler_20260111_004550.pkl"
METADATA_PATH = MODELS_DIR / "model_metadata_20260111_004550.json"

# Verificar se os ficheiros existem
def verify_files():
    """Verifica se todos os ficheiros necessários existem"""
    missing_files = []
    
    for file_path, name in [
        (MODEL_PATH, "Modelo"),
        (SCALER_PATH, "Scaler"),
        (METADATA_PATH, "Metadata")
    ]:
        if not file_path.exists():
            missing_files.append(f"{name}: {file_path}")
    
    if missing_files:
        error_msg = "Ficheiros não encontrados:\n" + "\n".join(missing_files)
        error_msg += f"\n\nDiretório base: {BASE_DIR}"
        error_msg += f"\nDiretório models: {MODELS_DIR}"
        error_msg += f"\nDiretório atual: {os.getcwd()}"
        raise FileNotFoundError(error_msg)

# Verificar ficheiros antes de carregar
verify_files()

# Carregar modelo, scaler e metadata
print(f"A carregar modelo de: {MODEL_PATH}")
model = joblib.load(MODEL_PATH)
scaler = joblib.load(SCALER_PATH)
with open(METADATA_PATH, "r") as f:
    metadata = json.load(f)
features = metadata["features"]

print(f"✓ Modelo carregado com sucesso!")
print(f"✓ Features: {len(features)}")

# Criar FastAPI app
app = FastAPI(
    title="ML Trading Predictor API",
    description="API para previsão de movimentos de mercado usando Random Forest",
    version="1.0.0"
)

# Adicionar CORS (opcional, útil para frontend)
app.add_middleware(
    CORSMiddleware,
    allow_origins=["*"],
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {
        "message": "API de Predição ML está online",
        "status": "running",
        "endpoints": {
            "/predict": "POST - Fazer predição",
            "/health": "GET - Status da API",
            "/model-info": "GET - Informações do modelo",
            "/docs": "GET - Documentação interativa (Swagger)"
        }
    }


@app.get("/health")
def health_check():
    return {
        "status": "healthy",
        "model_loaded": model is not None,
        "scaler_loaded": scaler is not None,
        "features_count": len(features)
    }


@app.post("/predict")
def predict(data: PredictionInput):
    """
    Endpoint para fazer predições
    
    Retorna:
    - prediction: 0 (Desce) ou 1 (Sobe)
    - prediction_label: "Desce" ou "Sobe"
    - probability_up: Probabilidade de subida
    - probability_down: Probabilidade de descida
    """
    try:
        # Criar DataFrame com as features
        X_new = pd.DataFrame([{feat: 0 for feat in features}])
        
        # Preencher com os valores recebidos
        input_dict = data.model_dump()  # Usar model_dump() em vez de dict()
        for key, value in input_dict.items():
            if key in features:
                X_new.loc[0, key] = value
        
        # Escalar features
        X_scaled = scaler.transform(X_new[features])
        
        # Fazer predição
        pred = int(model.predict(X_scaled)[0])
        prob = float(model.predict_proba(X_scaled)[0, 1])
        
        return {
            "prediction": pred,
            "prediction_label": "Sobe" if pred == 1 else "Desce",
            "probability_up": round(prob, 4),
            "probability_down": round(1 - prob, 4),
            "confidence": round(max(prob, 1 - prob), 4)
        }
    except Exception as e:
        raise HTTPException(
            status_code=500, 
            detail=f"Erro ao fazer predição: {str(e)}"
        )


@app.route('/stock/decomposition', methods=['GET'])
def get_decomposition():
    symbol = request.args.get('symbol', 'AAPL')
    
    try:
        # Carregar dados do ticker (últimos 726 dias / ~2 anos)
        df = df_raw[df_raw['ticker'] == symbol].iloc[-726:].copy()
        
        if len(df) == 0:
            return jsonify({'error': 'Dados não encontrados'}), 404
        
        # Calcular Tendência (MA20)
        df['Trend'] = df['Close'].rolling(window=20).mean()
        
        # Calcular Ruído (Desvio da Tendência)
        df['Noise'] = df['Close'] - df['Trend']
        
        # Calcular Volatilidade (20 dias) em percentagem
        df['Returns'] = df['Close'].pct_change()
        df['Volatility'] = df['Returns'].rolling(window=20).std() * 100
        
        # Remover NaN
        df = df.dropna()
        
        # Preparar dados para o frontend
        data = []
        for _, row in df.iterrows():
            data.append({
                'date': row['Date'].strftime('%Y-%m-%d'),
                'close': round(float(row['Close']), 2),
                'trend': round(float(row['Trend']), 2),
                'noise': round(float(row['Noise']), 2),
                'volatility': round(float(row['Volatility']), 2)
            })
        
        return jsonify({
            'symbol': symbol,
            'data': data
        })
        
    except Exception as e:
        return jsonify({'error': str(e)}), 500
@app.get("/model-info")
def get_model_info():
    """Retorna informações sobre o modelo e features necessárias"""
    return {
        "model_type": metadata.get("model_type", "Unknown"),
        "training_date": metadata.get("training_date", "Unknown"),
        "features": features,
        "n_features": len(features),
        "model_path": str(MODEL_PATH),
        "base_dir": str(BASE_DIR)
    }


# Para executar diretamente com: python main.py
if __name__ == "__main__":
    import uvicorn
    print("\n" + "="*50)
    print("🚀 A iniciar ML Trading Predictor API")
    print("="*50)
    print("📍 URL: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("="*50 + "\n")
    uvicorn.run(app, host="127.0.0.1", port=8000)