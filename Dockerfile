FROM node:20

WORKDIR /app

COPY package.json package.json
COPY package-lock.json package-lock.json

RUN npm install

copy . .

CMD ["npm", "run", "dev"]

