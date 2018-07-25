FROM node:10

COPY . /app

WORKDIR /app

RUN yarn install --production --frozen-lockfile

CMD ["yarn", "start"]
