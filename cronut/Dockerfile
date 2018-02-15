FROM alpine:3.7 as clone-cronut

WORKDIR /
RUN apk --no-cache add git
RUN git clone https://github.com/harrystech/cronut.git

FROM ruby:2.5-alpine3.7

RUN mkdir /cronut
WORKDIR /cronut
COPY --from=clone-cronut /cronut .

RUN apk --no-cache add build-base nodejs postgresql-dev sqlite-dev
RUN bundle install

ENV CRONUT_BASE_TIME_ZONE Europe/Berlin
RUN apk --no-cache add tzdata \
 && cp /usr/share/zoneinfo/Europe/Berlin /etc/localtime \
 && echo "Europe/Berlin" >  /etc/timezone

COPY database.yml config/database.yml

ENV RAILS_ENV production
RUN bundle exec rake db:create
RUN bundle exec rake db:migrate

ENV PORT 80
ENV TOKEN token
EXPOSE 80
COPY entrypoint.sh entrypoint.sh
CMD ./entrypoint.sh
