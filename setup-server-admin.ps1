# Run this script as Administrator once to configure KilCard V2 as a persistent server

# 1. Open firewall port 8080
netsh advfirewall firewall add rule `
    name="KilCard V2" `
    dir=in `
    action=allow `
    protocol=TCP `
    localport=8080 `
    profile=public,private `
    description="KilCard V2 web app server"

Write-Host "Firewall rule added." -ForegroundColor Green

# 2. Register Task Scheduler task to auto-start at login
$action = New-ScheduledTaskAction `
    -Execute "cmd.exe" `
    -Argument "/c `"C:\Users\lkilc\Desktop\KilCard V2\start-server.bat`""

$trigger = New-ScheduledTaskTrigger -AtLogOn

$settings = New-ScheduledTaskSettingsSet `
    -ExecutionTimeLimit (New-TimeSpan -Hours 0) `
    -RestartCount 3 `
    -RestartInterval (New-TimeSpan -Minutes 1)

$principal = New-ScheduledTaskPrincipal `
    -UserId $env:USERNAME `
    -LogonType Interactive `
    -RunLevel Highest

Register-ScheduledTask `
    -TaskName "KilCard V2 Server" `
    -Action $action `
    -Trigger $trigger `
    -Settings $settings `
    -Principal $principal `
    -Description "Starts the KilCard V2 web server on port 8080 at login" `
    -Force

Write-Host "Task Scheduler entry created: 'KilCard V2 Server'" -ForegroundColor Green
Write-Host ""
Write-Host "Setup complete! The server will auto-start next time you log in." -ForegroundColor Cyan
Write-Host "Current server URL on your network: http://192.168.86.28:8080/" -ForegroundColor Cyan
