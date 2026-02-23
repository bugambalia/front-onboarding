"""
Carpeta: api/v1

Esta carpeta contiene la configuración de la versión 1 de la API.
Agrupa todos los routers de endpoints y los registra en un router principal.

Archivos típicos: api_router.py (agrega todos los endpoints)

Características:
- Versionado de API (v1, v2, etc.)
- Agrupa todos los routers de endpoints
- Permite evolucionar la API sin romper clientes existentes
"""

from fastapi import APIRouter
from app.api.v1.endpoints import example

api_router = APIRouter()

api_router.include_router(example.router, prefix="/example", tags=["example"])
