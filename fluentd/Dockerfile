FROM fluent/fluentd:v1.1.3

# Adapted from
# https://github.com/fluent/fluentd-docker-image/blob/master/v1.1/alpine/Dockerfile#L17-L34
# using the apk edge repository
RUN apk update \
 && apk upgrade \
 && apk add --no-cache \
        ca-certificates \
        ruby ruby-irb \
        su-exec==${SU_EXEC_VERSION}-r0 \
        dumb-init==${DUMB_INIT_VERSION}-r0 \
        --repository http://dl-3.alpinelinux.org/alpine/edge/main/ \
 && apk add --no-cache --virtual .build-deps \
        build-base \
        ruby-dev wget gnupg \
        --repository http://dl-3.alpinelinux.org/alpine/edge/main/ \
 && update-ca-certificates \
 && echo 'gem: --no-document' >> /etc/gemrc \
 && gem install oj -v 3.3.10 \
 && gem install json -v 2.1.0 \
 && gem install fluentd -v 1.1.3 \
 && apk del .build-deps \
 && rm -rf /var/cache/apk/* \
 && rm -rf /tmp/* /var/tmp/* /usr/lib/ruby/gems/*/cache/*.gem
