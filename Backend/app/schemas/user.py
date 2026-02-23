"""
Carpeta: schemas

Esta carpeta contiene los esquemas de Pydantic para validación
y serialización de datos de entrada/salida de la API.

Ejemplos: user.py, employee.py, token.py

Características:
- Modelos de Pydantic (no DB, solo validación)
- Definen estructura de request/response bodies
- Validación automática de tipos
- Documentación de API (OpenAPI/Swagger)
- Separación entre input, output, y modelos internos
"""

from pydantic import BaseModel, EmailStr


class UserBase(BaseModel):
    """Schema base para usuarios."""

    email: EmailStr


class UserCreate(UserBase):
    """Schema para crear un usuario."""

    password: str


class UserResponse(UserBase):
    """Schema para respuestas con datos de usuario."""

    id: int
    is_active: bool

    class Config:
        from_attributes = True
