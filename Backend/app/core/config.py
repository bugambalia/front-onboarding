"""
Carpeta: core

Esta carpeta contiene la configuración central de la aplicación,
seguridad, dependencias, y utilidades core del sistema.

Ejemplos: config.py, security.py, dependencies.py, exceptions.py

Características:
- Configuración de la aplicación (variables de entorno)
- Funciones de seguridad (JWT, hashing, permisos)
- Dependencias inyectables de FastAPI
- Excepciones personalizadas
- Logging y monitoreo
"""

from pydantic_settings import BaseSettings


class Settings(BaseSettings):
    """Configuración de la aplicación usando variables de entorno."""

    app_name: str = "Sistema Integracion Empleados"
    app_version: str = "1.0.0"
    debug: bool = False
    database_url: str = "sqlite:///./test.db"
    secret_key: str = "change-this-in-production"
    algorithm: str = "HS256"
    access_token_expire_minutes: int = 30

    class Config:
        env_file = ".env"


settings = Settings()
