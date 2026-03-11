from fastapi import FastAPI
from contextlib import asynccontextmanager
from fastapi.middleware.cors import CORSMiddleware # to "allow" the frontend access

# import our files
from database import create_db_and_tables
from routes.auth import router as auth_router
from routes.user import router as user_router
from routes.lobby import router as lobby_router
from routes.game import router as game_router


# Lifespan event handler. Ensures the tables are created every time the application starts.
@asynccontextmanager
async def lifespan(app: FastAPI):
	# Code here runs on startup
	print("Startup: Creating database and tables...")
	create_db_and_tables()
	yield
	# Code here runs on shutdown
	print("Shutdown: Application closing.")


app = FastAPI(lifespan=lifespan)

# CORS: List of addresses we trust
origins = [
	"http://localhost",
	"http://localhost:3000"
	# Add the final URL here when you go online
	# "https://your-domain.com",
	# "https://www.your-domain.com" 
]

app.add_middleware(
	CORSMiddleware,
	allow_origins=origins,            # Allow requests from these addresses
	allow_credentials=True,           # Allow tokens/cookies
	allow_methods=["*"],              # Allow all methods (GET, POST, etc.)
	allow_headers=["*"],              # Allow all headers (inc. Authorization for JWT)
)

app.include_router(auth_router, prefix="/api")
app.include_router(user_router, prefix="/api")
app.include_router(lobby_router, prefix="/api")
app.include_router(game_router, prefix="/api")


@app.get("/")
def read_root():
	return {"message": "Hello from Python 3.12 and WSL2!"}
