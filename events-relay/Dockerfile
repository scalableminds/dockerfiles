FROM node:20-slim

COPY . /app

WORKDIR /app

RUN yarn install --production --frozen-lockfile

CMD ["yarn", "start"]
