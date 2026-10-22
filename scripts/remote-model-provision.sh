#!/bin/bash
set -euo pipefail
# Initial deployment only. Never edits Hysteria or global SSH authentication.
test "$(id -u)" = 0
test -f /root/dt-tunnel.pub
test ! -e /etc/ssh/sshd_config.d/60-dailyterminal-tunnel.conf
getent passwd dt-model-tunnel >/dev/null || useradd --create-home --shell /bin/false dt-model-tunnel
# Public-key authentication must remain possible with UsePAM=no; no usable password is created.
usermod --password '*' dt-model-tunnel
install -d -m 700 -o dt-model-tunnel -g dt-model-tunnel /home/dt-model-tunnel/.ssh
printf 'restrict,port-forwarding,permitlisten="127.0.0.1:21436" %s\n' "$(cat /root/dt-tunnel.pub)" > /home/dt-model-tunnel/.ssh/authorized_keys
chown dt-model-tunnel:dt-model-tunnel /home/dt-model-tunnel/.ssh/authorized_keys
chmod 600 /home/dt-model-tunnel/.ssh/authorized_keys
cat > /etc/ssh/sshd_config.d/60-dailyterminal-tunnel.conf <<'EOF'
Match User dt-model-tunnel
    AuthenticationMethods publickey
    PasswordAuthentication no
    KbdInteractiveAuthentication no
    AllowTcpForwarding remote
    AllowStreamLocalForwarding no
    PermitListen 127.0.0.1:21436
    PermitOpen none
    GatewayPorts no
    AllowAgentForwarding no
    X11Forwarding no
    PermitTTY no
    PermitUserRC no
    MaxSessions 0
Match all
EOF
if ! /usr/sbin/sshd -t; then
 rm /etc/ssh/sshd_config.d/60-dailyterminal-tunnel.conf
 exit 1
fi
systemctl reload ssh
rm /root/dt-tunnel.pub
printf 'Restricted tunnel account configured\n'
# Keep a newly installed nginx from starting with its stock public website.
systemctl mask --runtime nginx.service
export DEBIAN_FRONTEND=noninteractive
apt-get update -qq
apt-get install -y --no-install-recommends nginx python3-venv
python3 -m venv /opt/dailyterminal-certbot
/opt/dailyterminal-certbot/bin/pip -q install 'certbot==5.4.0'
/opt/dailyterminal-certbot/bin/certbot --version
systemctl is-active hysteria-server.service
printf 'Packages prepared; public nginx remains stopped\n'
