import os
import uvicorn
from app.config import settings

if __name__ == "__main__":
    reload = os.getenv("RELOAD", "false").lower() == "true"
    uvicorn.run("app.main:app", host=settings.HOST, port=settings.PORT, reload=reload)