FROM alpine:3.7

# /etc/profile overwrites the path, which is undesired.
RUN echo "" > /etc/profile

# set Berlin timezone
RUN apk --no-cache add tzdata \
 && cp /usr/share/zoneinfo/Europe/Berlin /etc/localtime \
 && echo "Europe/Berlin" >  /etc/timezone \
 && apk del tzdata

# group ping uses gid 999, which is contested
RUN delgroup ping
