"""
Carpeta: tests/integration

Esta carpeta contiene pruebas de integración que testean
la interacción entre componentes (endpoints + DB, servicios + DB, etc.).

Ejemplos: test_user_endpoints.py, test_auth_flow.py

Características:
- Testean la interacción entre módulos
- Pueden usar una DB de test
- Testean endpoints completos con TestClient
- Validan flujos end-to-end del backend
- Más lentas que las unitarias
"""

# Placeholder for integration tests
from fastapi.testclient import TestClient
from app.main import app

client = TestClient(app)


def test_read_root():
    """Test de integración de ejemplo."""
    response = client.get("/")
    assert response.status_code == 200
    assert "message" in response.json()
