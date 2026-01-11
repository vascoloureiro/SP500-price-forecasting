"""
Script para executar a API em modo desenvolvimento com hot-reload
"""
import uvicorn

if __name__ == "__main__":
    print("\n" + "="*60)
    print("🚀 ML Trading Predictor API - MODO DESENVOLVIMENTO")
    print("="*60)
    print("📍 URL: http://localhost:8000")
    print("📚 Docs: http://localhost:8000/docs")
    print("📊 ReDoc: http://localhost:8000/redoc")
    print("🔄 Hot-reload: ATIVADO")
    print("="*60 + "\n")
    
    uvicorn.run(
        "app.main:app",
        host="127.0.0.1",
        port=8000,
        reload=True,
        log_level="info"
    )