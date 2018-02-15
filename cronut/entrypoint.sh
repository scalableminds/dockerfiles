#!/usr/bin/env sh
set -euo pipefail

ruby <<'EOF'
require "./config/environment.rb"

token_name = "default"
token_string = ENV["TOKEN"]
token = ApiToken.find_by_name(token_name)

if token.nil?
  ApiToken.create!({name: token_name, token: token_string})
else
  token.update_attribute(:token, token_string)
end
puts ApiToken.find_by_name(token_name).token
EOF

bundle exec clockwork lib/clock.rb &
exec bundle exec rails server -p $PORT --binding 0.0.0.0
