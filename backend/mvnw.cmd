@echo off
setlocal

set MAVEN_VERSION=3.9.9
set MAVEN_HOME=%USERPROFILE%\.m2\wrapper\dists\apache-maven-%MAVEN_VERSION%
set MAVEN_CMD=%MAVEN_HOME%\bin\mvn.cmd

if not exist "%MAVEN_CMD%" (
    echo [Maven Wrapper] Dang tu dong tai Apache Maven %MAVEN_VERSION%...
    powershell -NoProfile -ExecutionPolicy Bypass -Command "$ErrorActionPreference = 'Stop'; $url = 'https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/%MAVEN_VERSION%/apache-maven-%MAVEN_VERSION%-bin.zip'; $zip = [System.IO.Path]::GetTempFileName() + '.zip'; Invoke-WebRequest -Uri $url -OutFile $zip -UseBasicParsing; $dest = '%USERPROFILE%\.m2\wrapper\dists'; New-Item -ItemType Directory -Path $dest -Force | Out-Null; Expand-Archive -Path $zip -DestinationPath $dest -Force; Remove-Item $zip -Force"
    if errorlevel 1 (
        echo [Maven Wrapper] Loi khi tai Maven! Vui long kiem tra ket noi Internet.
        exit /b 1
    )
    echo [Maven Wrapper] Cai dat Apache Maven thanh cong!
)

call "%MAVEN_CMD%" %*
exit /b %ERRORLEVEL%
