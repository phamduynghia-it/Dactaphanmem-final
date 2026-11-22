# Maven Wrapper Script for PowerShell
param(
    [Parameter(ValueFromRemainingArguments = $true)]
    [string[]]$Arguments
)

$ErrorActionPreference = "Stop"

$MAVEN_VERSION = "3.9.9"
$MAVEN_HOME = "$HOME\.m2\wrapper\dists\apache-maven-$MAVEN_VERSION"
$MAVEN_CMD = "$MAVEN_HOME\bin\mvn.cmd"

if (-not (Test-Path $MAVEN_CMD)) {
    Write-Host "[Maven Wrapper] Dang tu dong tai Apache Maven $MAVEN_VERSION ve may..." -ForegroundColor Cyan
    $ZIP_URL = "https://repo.maven.apache.org/maven2/org/apache/maven/apache-maven/$MAVEN_VERSION/apache-maven-$MAVEN_VERSION-bin.zip"
    $TEMP_ZIP = "$env:TEMP\apache-maven-$MAVEN_VERSION-bin.zip"
    
    $TARGET_DIR = "$HOME\.m2\wrapper\dists"
    if (-not (Test-Path $TARGET_DIR)) {
        New-Item -ItemType Directory -Path $TARGET_DIR -Force | Out-Null
    }

    try {
        Invoke-WebRequest -Uri $ZIP_URL -OutFile $TEMP_ZIP -UseBasicParsing
        Expand-Archive -Path $TEMP_ZIP -DestinationPath $TARGET_DIR -Force
        Remove-Item -Path $TEMP_ZIP -Force -ErrorAction SilentlyContinue
        Write-Host "[Maven Wrapper] Cai dat Apache Maven thanh cong!" -ForegroundColor Green
    }
    catch {
        Write-Host "[Maven Wrapper] Loi khi tai Maven: $_" -ForegroundColor Red
        exit 1
    }
}

if (-not (Test-Path $MAVEN_CMD)) {
    Write-Host "Khong tim thay $MAVEN_CMD sau khi giai nen!" -ForegroundColor Red
    exit 1
}

& $MAVEN_CMD @Arguments
exit $LASTEXITCODE
