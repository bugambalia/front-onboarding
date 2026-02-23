"""
Carpeta: db

Esta carpeta contiene la configuración de la base de datos,
sesiones, y utilidades relacionadas.

Ejemplos: session.py, base.py, init_db.py

Características:
- Configuración de conexión a la base de datos
- Creación de sesiones (SessionLocal)
- Dependency para inyectar DB en endpoints
- Inicialización de datos (seeds)
- Configuración de Alembic para migraciones
"""

from sqlalchemy import create_engine
from sqlalchemy.orm import sessionmaker
from app.core.config import settings

engine = create_engine(settings.database_url, connect_args={"check_same_thread": False})
SessionLocal = sessionmaker(autocommit=False, autoflush=False, bind=engine)


def get_db():
    """
    Dependency para obtener sesión de base de datos.
    Se usa en endpoints con Depends(get_db).
    """
    db = SessionLocal()
    try:
        yield db
    finally:
        db.close()
