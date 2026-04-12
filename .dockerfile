FROM node:22

RUN apt-get update && apt-get install -y \
    gcc \
    g++ \
    openjdk-17-jdk \
    python3 \
    python3-pip \
    && apt-get clean

WORKDIR /app

COPY package*.json ./
RUN npm install

COPY . .

CMD ["node", "src/worker.js"]