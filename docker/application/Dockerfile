# FROM ubuntu:24.04

# ENV DEBIAN_FRONTEND=noninteractive

# # --------------------------------------------------
# # System packages
# # --------------------------------------------------

# RUN apt-get update && \
#     apt-get install -y \
#         git \
#         curl \
#         wget \
#         python3 \
#         python3-pip \
#         python3-venv \
#         python3-dev \
#         build-essential && \
#     rm -rf /var/lib/apt/lists/*

# # --------------------------------------------------
# # Node.js 22
# # --------------------------------------------------

# RUN curl -fsSL https://deb.nodesource.com/setup_22.x | bash - && \
#     apt-get update && \
#     apt-get install -y nodejs && \
#     rm -rf /var/lib/apt/lists/*

# # --------------------------------------------------
# # Python virtual environment
# # IMPORTANT:
# # Keep this OUTSIDE the project directory because
# # the project directory will be bind-mounted.
# # --------------------------------------------------

# RUN python3 -m venv /opt/venv

# # Make venv Python/pip/uvicorn available globally
# ENV PATH="/opt/venv/bin:$PATH"

# # --------------------------------------------------
# # Working directory
# # --------------------------------------------------

# WORKDIR /workspace/ai-incident-resolution-agent

# # --------------------------------------------------
# # Install Python dependencies
# # --------------------------------------------------

# COPY backend/requirements.txt /tmp/requirements.txt

# RUN pip install --upgrade pip && \
#     pip install -r /tmp/requirements.txt

# # --------------------------------------------------
# # Copy application
# # --------------------------------------------------

# COPY . /workspace/ai-incident-resolution-agent

# # --------------------------------------------------
# # Default command
# # --------------------------------------------------

# CMD ["bash"]

FROM ubuntu:24.04

ENV DEBIAN_FRONTEND=noninteractive

# --------------------------------------------------
# System packages
# --------------------------------------------------

RUN apt-get update && \
    apt-get install -y \
        git \
        curl \
        wget \
        python3 \
        python3-pip \
        python3-venv \
        python3-dev \
        build-essential && \
    rm -rf /var/lib/apt/lists/*

# --------------------------------------------------
# Python virtual environment
# IMPORTANT:
# Keep this OUTSIDE the project directory because
# the project directory is bind-mounted.
# --------------------------------------------------

RUN python3 -m venv /opt/venv

ENV PATH="/opt/venv/bin:$PATH"

# --------------------------------------------------
# Working directory
# --------------------------------------------------

WORKDIR /workspace/ai-incident-resolution-agent

# --------------------------------------------------
# Install Python dependencies
# --------------------------------------------------

COPY backend/requirements.txt /tmp/requirements.txt

RUN pip install --upgrade pip && \
    pip install -r /tmp/requirements.txt

# --------------------------------------------------
# Copy application
# --------------------------------------------------

COPY . /workspace/ai-incident-resolution-agent

# --------------------------------------------------
# Backend port
# --------------------------------------------------

EXPOSE 8000

# --------------------------------------------------
# Start FastAPI
# --------------------------------------------------

CMD ["bash"]