FROM python:3.13-slim
COPY --from=ghcr.io/astral-sh/uv:latest /uv /uvx /bin/

# Copy the project into the image
ADD . /app
WORKDIR /app

# Install dependencies
RUN uv sync --locked
