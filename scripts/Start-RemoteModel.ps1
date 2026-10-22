param([switch]$Quiet)
$ErrorActionPreference='Stop'
$runtime='C:/Users/12860/.codex/tools/dailyterminal/remote-model'
$node='C:/Program Files/nodejs/node.exe'
try {
 if(-not (Test-NetConnection -ComputerName 127.0.0.1 -Port 12334 -InformationLevel Quiet -WarningAction SilentlyContinue)){throw '请先打开电脑上的 Hiddify 并连接节点。'}
 $null=Invoke-RestMethod -Uri 'http://127.0.0.1:11434/api/tags' -TimeoutSec 5
 $existing=Get-CimInstance Win32_Process -Filter "Name='node.exe'" | Where-Object { $_.CommandLine -like '*remote-model-supervisor.mjs*' -and $_.CommandLine -like '*dailyterminal*' }
 if(-not $existing){Start-Process -FilePath $node -ArgumentList @("$runtime/remote-model-supervisor.mjs") -WindowStyle Hidden -RedirectStandardError "$runtime/runtime-error.log" -RedirectStandardOutput "$runtime/runtime.log" | Out-Null}
 $config=Get-Content -LiteralPath "$runtime/remote-config.json" -Raw | ConvertFrom-Json
 $connected=$false
 for($attempt=0;$attempt -lt 12;$attempt++){
  try{$models=Invoke-RestMethod -Uri 'https://111.91.31.243/v1/models' -Headers @{Authorization="Bearer $($config.token)"} -TimeoutSec 5;if($models.data.id -contains $config.model){$connected=$true;break}}catch{}
  Start-Sleep -Milliseconds 1000
 }
 if(-not $connected){throw '连接服务正在重试。请确认 Hiddify 节点可用，再试一次。'}
 if(-not $Quiet){Add-Type -AssemblyName PresentationFramework;[System.Windows.MessageBox]::Show('手机模型入口已接通。请保持电脑、Ollama 和 Hiddify 运行。','手机模型连接') | Out-Null}
}catch{
 if(-not $Quiet){Add-Type -AssemblyName PresentationFramework;[System.Windows.MessageBox]::Show($_.Exception.Message,'手机模型连接') | Out-Null}
 throw '手机模型连接未就绪，请检查本机服务和连接日志。'
}
