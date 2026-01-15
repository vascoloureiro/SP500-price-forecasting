# Financial Signal Intelligence with Machine Learning & MLOps

This project presents an **end-to-end machine learning framework for financial time series intelligence**, focused on extracting structural trends from noisy market data.  
The system combines **signal decomposition**, **technical indicators**, **ensemble learning models**, and **MLOps practices**, and is deployed through a **Flask API** with a **Next.js frontend** for interaction and visualization.

---

## Project Overview

Financial markets are characterized by high volatility and a low signal-to-noise ratio, making predictive modeling a challenging task.  
Instead of treating price as a single raw variable, this project models financial time series as a **composite signal**, consisting of:

- **Trend component** (structural movement)
- **Noise component** (short-term volatility and market sentiment)

To achieve this, a **Kalman Filter** is applied as a preprocessing step, enabling a clear separation between informative signal and stochastic noise.

The extracted features are then used to train multiple **machine learning models**, focusing on:
- Market direction prediction
- Trend classification
- Volatility forecasting

---

##  Dataset

- **Assets**: AAPL, MSFT, GOOGL (S&P 500 – Technology sector)
- **Data**: OHLCV (Open, High, Low, Close, Volume)
- **Period**: 5 years of historical data
- **Source**: Yahoo Finance API

A strict **temporal split** is used (80% train / 20% test) to prevent look-ahead bias.

---

## Feature Engineering

The dataset is enriched with multiple groups of features:

### 🔹 Signal Decomposition
- Trend (Kalman Filter)
- Noise
- Signal-to-Noise Ratio (SNR)

### 🔹 Technical Indicators
- Log returns (1d, 5d, 10d)
- Simple Moving Averages (SMA)
- RSI (Relative Strength Index)
- Bollinger Bands (distance, Z-score)
- Volatility metrics
- Volume-based indicators

### 🔹 Trend Validation
- Linear regression slope
- R²-based trend strength filtering

---

## Prediction Targets

The project supports **multi-task learning**, including:

- **Binary classification**: Market direction (Up / Down)
- **Multiclass classification**: Down / Neutral / Up
- **Volatility prediction**: Stable vs Volatile
- **Regression**: Future return percentage

---

## Models Implemented

The following models were trained and evaluated:

- Logistic Regression
- Random Forest
- Gradient Boosting
- XGBoost
- LightGBM

 **Random Forest** achieved the best performance for binary market direction prediction, with balanced accuracy consistently above random baseline.

---

## Evaluation Strategy

- Temporal validation (TimeSeriesSplit / Walk-Forward)
- Balanced Accuracy, F1-score, ROC-AUC
- Confusion matrices
- Probability calibration analysis

Results are intentionally conservative, reflecting the **weak and noisy nature of financial signals**, in line with financial literature.

---

## MLOps & Model Deployment

To ensure reproducibility and real-world usability:

- Best-performing models are **exported as `.pkl` files**
- Model metadata is stored (features, metrics, timestamps)
- Designed for **real-time inference**

---

## API & Frontend

### 🔹 Backend — Flask API
A RESTful API built with **Flask** exposes the trained models for inference:
- Loads versioned ML models
- Accepts feature inputs
- Returns probabilistic predictions

### 🔹 Frontend — Next.js
A **Next.js frontend** provides:
- Interaction with the Flask API
- Visualization of predictions
- User-friendly interface for model outputs

---

## Key Insights

- Market direction prediction is **slightly better than random**, which is expected in efficient markets.
- Volatility is **significantly more predictable** than price direction.
- Short-term returns and volume dynamics are among the most important features.
- Signal decomposition improves model stability and interpretability.

---

## Future Work

- Out-of-sample evaluation on live market data
- Ensemble strategies across multiple models
- Integration of macroeconomic indicators
- NLP-based sentiment analysis using financial news and LLMs
- Automated retraining and monitoring pipelines

---

## Disclaimer

This project is intended for **educational and research purposes only**.  
It does **not constitute financial advice** and should not be used directly for trading decisions.

---

## Author

**Vasco Loureiro**  
MSc Student in Applied Artificial Intelligence  
Software Engineer & ML Enthusiast
