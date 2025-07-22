FROM python:3.13-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy dependency files from root
COPY pyproject.toml uv.lock ./

# Copy the backend app code
ADD backend /app/backend
WORKDIR /app/backend

# Install dependencies
RUN uv sync --locked

CMD ["uv", "run", "uvicorn", "app.main:app", "--host=0.0.0.0", "--port=8000"]