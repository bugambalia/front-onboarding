"""
Carpeta: models

Esta carpeta contiene los modelos de base de datos (ORM models).
Define la estructura de las tablas y relaciones en la base de datos.

Ejemplos: user.py, employee.py, department.py

Características:
- Modelos de SQLAlchemy (o el ORM que uses)
- Definen la estructura de tablas
- Relaciones entre entidades (ForeignKey, relationships)
- Constraints y validaciones a nivel de DB
- Usado por Alembic para migraciones
"""

from sqlalchemy import Column, Integer, String, Boolean
from sqlalchemy.ext.declarative import declarative_base

Base = declarative_base()


class User(Base):
    """Modelo de ejemplo para usuarios."""

    __tablename__ = "users"

    id = Column(Integer, primary_key=True, index=True)
    email = Column(String, unique=True, index=True, nullable=False)
    hashed_password = Column(String, nullable=False)
    is_active = Column(Boolean, default=True)
