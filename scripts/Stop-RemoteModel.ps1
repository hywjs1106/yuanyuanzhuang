$ErrorActionPreference='Stop'
# Match only this installation's command lines; never stop Ollama or Hiddify.
$processes=Get-CimInstance Win32_Process | Where-Object {
 ($_.Name -eq 'node.exe' -and $_.CommandLine -like '*dailyterminal*remote-model*' -and ($_.CommandLine -like '*remote-model-supervisor.mjs*' -or $_.CommandLine -like '*remote-model-bridge.mjs*' -or $_.CommandLine -like '*remote-model-ssh.mjs*')) -or
 ($_.Name -eq 'ssh.exe' -and $_.CommandLine -like '*dailyterminal*remote-model*tunnel_ed25519*' -and $_.CommandLine -like '*dt-model-tunnel@111.91.31.243*')
}
$supervisors=$processes | Where-Object {$_.CommandLine -like '*remote-model-supervisor.mjs*'}
$supervisors | ForEach-Object {Stop-Process -Id $_.ProcessId -ErrorAction SilentlyContinue}
$processes | Where-Object {$_.ProcessId -notin $supervisors.ProcessId} | ForEach-Object {Stop-Process -Id $_.ProcessId -ErrorAction SilentlyContinue}
$pidFile='C:/Users/12860/.codex/tools/dailyterminal/remote-model/supervisor.pid'
if(Test-Path -LiteralPath $pidFile){Remove-Item -LiteralPath $pidFile}
'手机模型连接已停止，电脑模型和加速器保持原状。'
