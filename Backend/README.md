# Backend FastAPI

## Estructura del proyecto

```
Backend/
├── venv/                  # Entorno virtual de Python
├── app/
│   ├── main.py           # Entry point de la aplicación
│   ├── api/              # Endpoints y routers
│   │   └── v1/           # Versión 1 de la API
│   │       ├── endpoints/  # Endpoints por recurso
│   │       └── api_router.py
│   ├── core/             # Configuración y seguridad
│   ├── models/           # Modelos de base de datos (ORM)
│   ├── schemas/          # Schemas Pydantic (validación)
│   ├── services/         # Lógica de negocio
│   ├── db/               # Configuración de base de datos
│   ├── utils/            # Utilidades y helpers
│   └── tests/            # Pruebas
│       ├── unit/
│       └── integration/
├── requirements.txt       # Dependencias
└── .env.example          # Variables de entorno de ejemplo
```

## Setup

1. Activar el entorno virtual:
```bash
source venv/bin/activate  # Linux/Mac
# o
venv\Scripts\activate  # Windows
```

2. Instalar dependencias:
```bash
pip install -r requirements.txt
```

3. Copiar .env.example a .env y configurar:
```bash
cp .env.example .env
```

4. Ejecutar la aplicación:
```bash
uvicorn app.main:app --reload
```

5. Ver documentación interactiva:
- Swagger UI: http://localhost:8000/docs
- ReDoc: http://localhost:8000/redoc
