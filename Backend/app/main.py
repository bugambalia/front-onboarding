"""
Entry point de la aplicación FastAPI.

Este archivo inicializa la aplicación, configura middleware,
incluye los routers, y define eventos de startup/shutdown.
"""

from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI(
    title="Sistema Integracion Empleados API",
    description="API para el sistema de integración de empleados",
    version="1.0.0",
)

# Configurar CORS - Permitir múltiples orígenes
origins = [
    "http://localhost:5173",
    "http://localhost:3000",
    "http://localhost:5174",
    "https://localhost:5173",
    # Agregar aquí el dominio de producción del frontend cuando esté disponible
    # "https://tu-frontend.dominio.com",
]

app.add_middleware(
    CORSMiddleware,
    allow_origins=origins,
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)


@app.get("/")
def read_root():
    return {"message": "Sistema Integracion Empleados API"}


@app.get("/health")
def health_check():
    return {"status": "healthy"}
