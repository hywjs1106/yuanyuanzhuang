#!/bin/bash
set -euo pipefail
if test -f /etc/nginx/sites-available/dailyterminal && grep -q 'listen 443 ssl;' /etc/nginx/sites-available/dailyterminal; then
 printf 'HTTPS is already configured; use a separate credential rotation procedure for later changes\n'
 exit 0
fi
test -s /root/dt-api-auth.conf
test -s /etc/letsencrypt/live/dailyterminal-ip/fullchain.pem
install -m 600 /root/dt-api-auth.conf /etc/nginx/conf.d/dailyterminal-auth.conf
# nginx builds a map when it parses it: this must precede the long bearer key.
sed -i '1i map_hash_bucket_size 128;' /etc/nginx/conf.d/dailyterminal-auth.conf
rm /root/dt-api-auth.conf
cat > /etc/nginx/conf.d/dailyterminal-limits.conf <<'EOF'
limit_req_zone $binary_remote_addr zone=dt_model_rate:1m rate=15r/m;
limit_conn_zone $binary_remote_addr zone=dt_model_conn:1m;
EOF
cp /etc/nginx/sites-available/dailyterminal /etc/nginx/sites-available/dailyterminal.before-https
cat >> /etc/nginx/sites-available/dailyterminal <<'EOF'
server {
 listen 443 ssl;
 server_name 111.91.31.243;
 server_tokens off;
 ssl_certificate /etc/letsencrypt/live/dailyterminal-ip/fullchain.pem;
 ssl_certificate_key /etc/letsencrypt/live/dailyterminal-ip/privkey.pem;
 ssl_protocols TLSv1.2 TLSv1.3;
 ssl_session_tickets off;
 access_log off;
 client_max_body_size 128k;
 client_body_timeout 15s;
 client_header_timeout 10s;
 send_timeout 30s;
 keepalive_timeout 20s;
 add_header Cache-Control no-store always;
 add_header X-Content-Type-Options nosniff always;
 if ($dt_authorized = 0) { return 401; }
 limit_req zone=dt_model_rate burst=6 nodelay;
 limit_req_status 429;
 limit_conn dt_model_conn 2;
 limit_conn_status 429;
 proxy_connect_timeout 3s;
 proxy_send_timeout 15s;
 proxy_read_timeout 95s;
 proxy_request_buffering on;
 proxy_buffering off;
 proxy_http_version 1.1;
 proxy_set_header Host 127.0.0.1;
 proxy_set_header Connection "";
 proxy_intercept_errors on;
 error_page 502 504 =503 @offline;
 location = /v1/models {
  if ($request_method != GET) { return 405; }
  proxy_pass http://127.0.0.1:21436;
 }
 location = /v1/chat/completions {
  if ($request_method != POST) { return 405; }
  proxy_pass http://127.0.0.1:21436;
 }
 location @offline {
  default_type application/json;
  return 503 '{"error":{"message":"电脑模型暂时离线，请确认电脑、Hiddify 和连接服务正在运行"}}';
 }
 location / { return 404; }
}
EOF
if ! nginx -t; then
 cp /etc/nginx/sites-available/dailyterminal.before-https /etc/nginx/sites-available/dailyterminal
 exit 1
fi
systemctl reload nginx
cat > /usr/local/sbin/dailyterminal-reload-nginx <<'EOF'
#!/bin/sh
set -eu
/usr/sbin/nginx -t
/bin/systemctl reload nginx
EOF
chmod 755 /usr/local/sbin/dailyterminal-reload-nginx
cat > /etc/systemd/system/dailyterminal-certificate.service <<'EOF'
[Unit]
Description=Renew the DailyTerminal HTTPS certificate
After=network-online.target
Wants=network-online.target
[Service]
Type=oneshot
ExecStart=/opt/dailyterminal-certbot/bin/certbot renew --quiet --no-random-sleep-on-renew --deploy-hook /usr/local/sbin/dailyterminal-reload-nginx
EOF
cat > /etc/systemd/system/dailyterminal-certificate.timer <<'EOF'
[Unit]
Description=Check the short-lived DailyTerminal certificate twice daily
[Timer]
OnCalendar=*-*-* 00,12:00:00
RandomizedDelaySec=3600
Persistent=true
[Install]
WantedBy=timers.target
EOF
systemctl daemon-reload
systemctl enable --now dailyterminal-certificate.timer
systemctl is-active hysteria-server.service nginx.service dailyterminal-certificate.timer
openssl x509 -in /etc/letsencrypt/live/dailyterminal-ip/fullchain.pem -noout -dates -ext subjectAltName
