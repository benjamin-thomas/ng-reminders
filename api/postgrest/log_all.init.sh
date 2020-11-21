#!/bin/bash

# 1. Add logging
# http://postgrest.org/en/v7.0.0/admin.html#logging
echo "log_statement = 'all'" >> /var/lib/postgresql/data/postgresql.conf

# 2. Then check the logs that way
# docker-compose logs -f db

/docker-entrypoint.sh "$@"
