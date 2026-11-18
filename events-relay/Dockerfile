FROM node:20-slim

COPY . /app

WORKDIR /app

RUN mkdir -p logs

RUN yarn install --production --frozen-lockfile

CMD ["yarn", "start"]
