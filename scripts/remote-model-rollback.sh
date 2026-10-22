#!/bin/bash
set -euo pipefail
# Run only when intentionally removing this deployment. Stop the PC connection first.
# All named services/accounts/files below belong only to this deployment.
systemctl disable --now dailyterminal-certificate.timer || true
systemctl disable --now nginx.service || true
rm -f /etc/systemd/system/dailyterminal-certificate.timer /etc/systemd/system/dailyterminal-certificate.service
rm -f /etc/nginx/sites-enabled/dailyterminal /etc/nginx/conf.d/dailyterminal-auth.conf /etc/nginx/conf.d/dailyterminal-limits.conf
rm -f /etc/ssh/sshd_config.d/60-dailyterminal-tunnel.conf
/usr/sbin/sshd -t
systemctl reload ssh
if id dt-model-tunnel >/dev/null 2>&1; then
 rm -f /home/dt-model-tunnel/.ssh/authorized_keys
 pkill -u dt-model-tunnel || true
 usermod --lock dt-model-tunnel
fi
systemctl daemon-reload
systemctl is-active hysteria-server.service
printf 'Only DailyTerminal remote access has been disabled. Hysteria is unchanged.\n'
