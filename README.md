```Swagger UI
   │
   │ HTTP POST
   ▼
FastAPI Router
   │
   │ validates request
   ▼
Pydantic Schema
   │
   │ Python object
   ▼
Service Layer
   │
   │ creates DB Model
   ▼
SQLAlchemy Model
   │
   │ uses DB Session
   ▼
SQLAlchemy Engine
   │
   ▼
psycopg
   │
   ▼
PostgreSQL```


