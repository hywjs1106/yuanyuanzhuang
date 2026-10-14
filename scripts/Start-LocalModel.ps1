param([switch]$AllowLan)
$ErrorActionPreference='Stop'
$bridgeDir='C:/Users/12860/.codex/tools/dailyterminal/local-model'
$configPath=Join-Path $bridgeDir 'config.json'
$config=Get-Content -LiteralPath $configPath -Raw | ConvertFrom-Json
$previousHost=$config.listenHost
if ($config.port -ne 11435 -or $config.model -ne 'qwen3.5-fast:latest') {throw 'Unexpected bridge configuration'}
if ($AllowLan) {
    if (-not (Get-NetIPAddress -InterfaceAlias 'WLAN' -AddressFamily IPv4 | Where-Object IPAddress -eq '192.168.10.2')) {throw 'Computer Wi-Fi address changed; update connection certificate and profile first'}
    $config.listenHost='192.168.10.2'
} else {$config.listenHost='127.0.0.1'}
$pidPath=Join-Path $bridgeDir 'bridge.pid'
if (Test-Path -LiteralPath $pidPath) {
    $bridgeId=[int](Get-Content -LiteralPath $pidPath)
    $old=Get-CimInstance Win32_Process -Filter "ProcessId=$bridgeId"
    if ($old) {
        if ($old.Name -ne 'node.exe' -or $old.CommandLine.Replace('\','/') -notlike '*dailyterminal/local-model/local-model-bridge.mjs*') {throw 'Bridge process identity mismatch; no process stopped'}
        Stop-Process -Id $bridgeId
    }
}
[IO.File]::WriteAllText($configPath,($config | ConvertTo-Json -Depth 8))
$bridge=Start-Process -FilePath 'C:/Program Files/nodejs/node.exe' -ArgumentList @((Join-Path $bridgeDir 'local-model-bridge.mjs'),'--config',$configPath) -WindowStyle Hidden -RedirectStandardOutput (Join-Path $bridgeDir 'bridge.log') -RedirectStandardError (Join-Path $bridgeDir 'bridge-error.log') -PassThru
try {
    & 'C:/Program Files/nodejs/node.exe' (Join-Path $bridgeDir 'check-bridge-health.mjs') $configPath
    if ($LASTEXITCODE -ne 0) {throw 'Authenticated HTTPS readiness check failed'}
    $bridge.Refresh()
    if ($bridge.HasExited) {throw 'Model bridge exited during startup'}
    [IO.File]::WriteAllText($pidPath,[string]$bridge.Id)
} catch {
    $bridge.Refresh()
    if (-not $bridge.HasExited) {Stop-Process -Id $bridge.Id}
    if (Test-Path -LiteralPath $pidPath) {Remove-Item -LiteralPath $pidPath}
    $config.listenHost=$previousHost
    [IO.File]::WriteAllText($configPath,($config | ConvertTo-Json -Depth 8))
    throw
}
Write-Output ('Model bridge started: '+$config.listenHost+':11435')
