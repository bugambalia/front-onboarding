"""
Carpeta: api/v1/endpoints

Esta carpeta contiene los endpoints/routers de la API organizados por recurso.
Cada archivo define las rutas HTTP para un recurso específico del dominio.

Ejemplos: users.py, auth.py, employees.py, departments.py

Características:
- Cada archivo es un APIRouter de FastAPI
- Agrupa endpoints relacionados por recurso
- Define operaciones CRUD y acciones específicas
- Incluye validación de entrada, respuestas, y documentación
- Se registran en el router principal (api_router.py)
"""

from fastapi import APIRouter

router = APIRouter()


@router.get("/example")
def get_example():
    """Endpoint de ejemplo."""
    return {"message": "This is an example endpoint"}
