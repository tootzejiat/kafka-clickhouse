FROM node:20

# Install build tools for node-rdkafka
RUN apt-get update && apt-get install -y \
    python3 \
    make \
    g++ \
    build-essential \
    libc6-dev \
    libsasl2-dev \
    libssl-dev \
    && rm -rf /var/lib/apt/lists/*

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

EXPOSE 5173 3001
