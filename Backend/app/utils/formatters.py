"""
Carpeta: utils

Esta carpeta contiene funciones utilitarias y helpers generales
que se usan en toda la aplicación.

Ejemplos: email.py, formatters.py, validators.py, datetime_utils.py

Características:
- Funciones puras sin estado
- Helpers reutilizables
- No dependen de FastAPI o DB directamente
- Validadores personalizados
- Formateadores de datos
- Utilidades de fecha, strings, etc.
"""


def format_phone(phone: str) -> str:
    """Formatea un número de teléfono."""
    # Ejemplo simple, ajustar según necesidad
    digits = "".join(filter(str.isdigit, phone))
    if len(digits) == 10:
        return f"({digits[:3]}) {digits[3:6]}-{digits[6:]}"
    return phone


def sanitize_string(value: str) -> str:
    """Sanitiza un string removiendo caracteres no deseados."""
    return value.strip()
