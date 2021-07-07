FROM node:15-slim

COPY . /app

WORKDIR /app

RUN yarn install --production --frozen-lockfile

CMD ["yarn", "start"]
