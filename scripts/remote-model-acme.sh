#!/bin/bash
set -euo pipefail
if test -f /etc/nginx/sites-available/dailyterminal && grep -q 'listen 443 ssl;' /etc/nginx/sites-available/dailyterminal; then
 printf 'HTTPS is already configured; preserving the existing site\n'
 exit 0
fi
install -d -m 755 /var/lib/dailyterminal-acme/.well-known/acme-challenge
cat > /etc/nginx/sites-available/dailyterminal <<'EOF'
server {
 listen 80 default_server;
 server_name 111.91.31.243;
 server_tokens off;
 access_log off;
 location ^~ /.well-known/acme-challenge/ {
  root /var/lib/dailyterminal-acme;
  default_type text/plain;
  try_files $uri =404;
 }
 location / { return 404; }
}
EOF
if test -L /etc/nginx/sites-enabled/default; then unlink /etc/nginx/sites-enabled/default; fi
ln -sfn /etc/nginx/sites-available/dailyterminal /etc/nginx/sites-enabled/dailyterminal
nginx -t
systemctl unmask --runtime nginx.service
systemctl enable --now nginx.service
printf 'dailyterminal-acme-ready\n' > /var/lib/dailyterminal-acme/.well-known/acme-challenge/reachability
printf 'ACME HTTP endpoint ready\n'
