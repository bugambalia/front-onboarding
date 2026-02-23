"""
Carpeta: services

Esta carpeta contiene la lógica de negocio de la aplicación.
Capa intermedia entre endpoints y modelos/base de datos.

Ejemplos: user_service.py, auth_service.py, email_service.py

Características:
- Lógica de negocio compleja
- Orquestación de operaciones de DB
- Interacción con servicios externos
- Transformación de datos
- Validaciones de negocio
- Reutilizable en múltiples endpoints
"""

from sqlalchemy.orm import Session
from app.models.user import User
from app.schemas.user import UserCreate
from app.core.security import get_password_hash


class UserService:
    """Servicio para operaciones con usuarios."""

    @staticmethod
    def create_user(db: Session, user: UserCreate) -> User:
        """Crea un nuevo usuario."""
        hashed_password = get_password_hash(user.password)
        db_user = User(email=user.email, hashed_password=hashed_password)
        db.add(db_user)
        db.commit()
        db.refresh(db_user)
        return db_user

    @staticmethod
    def get_user_by_email(db: Session, email: str) -> User | None:
        """Obtiene un usuario por email."""
        return db.query(User).filter(User.email == email).first()
