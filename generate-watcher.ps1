### SET FOLDER TO WATCH + FILES TO WATCH + SUBFOLDERS YES/NO
    $defWatcher = New-Object System.IO.FileSystemWatcher
    $defWatcher.Path = "C:\Users\Nathan\Documents\GitHub\GrizzlyNacho.github.io\definitions"
    $defWatcher.Filter = "*.*"
    $defWatcher.IncludeSubdirectories = $true
    $defWatcher.EnableRaisingEvents = $true  

    $templateWatcher = New-Object System.IO.FileSystemWatcher
    $templateWatcher.Path = "C:\Users\Nathan\Documents\GitHub\GrizzlyNacho.github.io\templates"
    $templateWatcher.Filter = "*.*"
    $templateWatcher.IncludeSubdirectories = $true
    $templateWatcher.EnableRaisingEvents = $true  

### DEFINE ACTIONS AFTER AN EVENT IS DETECTED
    $action = { 
                # $path = $Event.SourceEventArgs.FullPath
                # $changeType = $Event.SourceEventArgs.ChangeType
                # $logline = "$(Get-Date), $changeType, $path"
                # Add-content "C:\Users\Nathan\Documents\GitHub\GrizzlyNacho.github.io\log.txt" -value $logline
                Start-Process -FilePath "py" -ArgumentList "C:\Users\Nathan\Documents\GitHub\GrizzlyNacho.github.io\generateHtml.py" -NoNewWindow
              }     
### DECIDE WHICH EVENTS SHOULD BE WATCHED 
    Register-ObjectEvent $defWatcher "Created" -Action $action
    Register-ObjectEvent $defWatcher "Changed" -Action $action
    Register-ObjectEvent $defWatcher "Deleted" -Action $action
    Register-ObjectEvent $defWatcher "Renamed" -Action $action
    Register-ObjectEvent $templateWatcher "Created" -Action $action
    Register-ObjectEvent $templateWatcher "Changed" -Action $action
    Register-ObjectEvent $templateWatcher "Deleted" -Action $action
    Register-ObjectEvent $templateWatcher "Renamed" -Action $action
    while ($true) {sleep 5}