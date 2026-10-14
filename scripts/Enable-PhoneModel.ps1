# Requires explicit user approval and an elevated PowerShell. No global profile change.
$ErrorActionPreference='Stop'
$bridgeDir='C:/Users/12860/.codex/tools/dailyterminal/local-model'
$statusPath=Join-Path $bridgeDir 'activation-status.json'
$createdRule=$false
try {
    $principal=[Security.Principal.WindowsPrincipal][Security.Principal.WindowsIdentity]::GetCurrent()
    if (-not $principal.IsInRole([Security.Principal.WindowsBuiltInRole]::Administrator)) {throw 'Administrator approval is required for the single firewall rule'}
    if (-not (Get-NetIPAddress -InterfaceAlias 'WLAN' -AddressFamily IPv4 | Where-Object IPAddress -eq '192.168.10.2')) {throw 'Wi-Fi address changed'}
    $ruleName='DailyTerminal-LocalModel-TLS-11435'
    if (Get-NetFirewallRule -Name $ruleName -ErrorAction SilentlyContinue) {throw 'A rule with this name already exists; inspect it before changing anything'}
    New-NetFirewallRule -Name $ruleName -DisplayName 'DailyTerminal local model (Wi-Fi only)' -Direction Inbound -Action Allow -Protocol TCP -LocalPort 11435 -LocalAddress '192.168.10.2' -RemoteAddress '192.168.10.0/24' -InterfaceAlias 'WLAN' -Program 'C:/Program Files/nodejs/node.exe' -Profile Any | Out-Null
    $createdRule=$true
    & (Join-Path $bridgeDir 'Start-LocalModel.ps1') -AllowLan
    [IO.File]::WriteAllText($statusPath,'{"ok":true,"address":"192.168.10.2","port":11435}')
} catch {
    $activationError=$_.Exception.Message
    if ($createdRule) {Remove-NetFirewallRule -Name $ruleName -ErrorAction SilentlyContinue}
    if ($createdRule) {try {& (Join-Path $bridgeDir 'Start-LocalModel.ps1')} catch {Write-Warning 'Localhost restart failed; no phone access was enabled'}}
    [IO.File]::WriteAllText($statusPath,(@{ok=$false;error=$activationError} | ConvertTo-Json))
    throw
}
