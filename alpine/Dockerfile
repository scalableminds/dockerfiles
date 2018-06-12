FROM alpine:3.7

RUN apk --no-cache upgrade
RUN apk --no-cache add ca-certificates

# /etc/profile overwrites the path, which is undesired.
RUN echo "" > /etc/profile

# set Berlin timezone
RUN apk --no-cache add --virtual time tzdata \
 && cp /usr/share/zoneinfo/Europe/Berlin /etc/localtime \
 && echo "Europe/Berlin" >  /etc/timezone \
 && apk del time

# group ping uses gid 999, which is contested
RUN delgroup ping
