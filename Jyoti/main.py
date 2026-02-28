from fastapi import FastAPI
from schemas import TransactionInput
from inference import predict_with_explanation
from mandi_price.price_anomaly import detect_price_anomaly

app = FastAPI()

@app.post("risk-score")
def risk_score(data: TransactionInput):
    return predict_with_explanation(data.dict())

@app.get("/health")
def health_check():
    return {"status": "ok"}

@app.post("/api/soil/analyze")
def analyze_soil(data: dict):
    # Calculate a proxy "ML Score" based on N, P, K, pH, temp, and moisture
    n = float(data.get("n", 0))
    p = float(data.get("p", 0))
    k = float(data.get("k", 0))
    ph = float(data.get("ph", 7))
    temp = float(data.get("temp", 25))
    moisture = float(data.get("moisture", 50))
    
    # Simple algorithm returning a score between 0 and 100 for demo purposes
    # Real ML model logic would go here
    score = min(100, int(((n + p + k) / 3) * 1.5))
    
    if score > 80:
        status = "Optimal"
    elif score > 50:
        status = "Moderate"
    else:
        status = "Critical"

    return {
        "success": True,
        "data": {
            "score": score,
            "status": status,
            "targetCrop": data.get("targetCrop", "Unknown")
        }
    }


@app.post("price-anomaly")
def price_anomaly(data: dict):
    return detect_price_anomaly(data)