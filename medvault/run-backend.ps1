Param(
    [switch]$UseMaven
)

# Helper to set environment variables from a local .env file (if present)
$envFile = Join-Path $PSScriptRoot '.env'
if (Test-Path $envFile) {
    Get-Content $envFile | ForEach-Object {
        if ($_ -match '^[\s#]') { return }
        if ($_ -match '^\s*$') { return }
        if ($_ -match '^\s*([^=]+)=(.*)$') {
            $k = $matches[1].Trim()
            $v = $matches[2].Trim()
            Set-Item -Path Env:\$k -Value $v
        }
    }
} else {
    Write-Host "No .env file found in $PSScriptRoot. You can create one from .env.example or set environment variables manually." -ForegroundColor Yellow
}

# Ensure sensible defaults for JPA dialect and ddl-auto when connecting to Postgres
if (-not $env:SPRING_JPA_DIALECT -or $env:SPRING_JPA_DIALECT -eq '') {
    $env:SPRING_JPA_DIALECT = 'org.hibernate.dialect.PostgreSQLDialect'
}
if (-not $env:SPRING_JPA_DDL_AUTO -or $env:SPRING_JPA_DDL_AUTO -eq '') {
    $env:SPRING_JPA_DDL_AUTO = 'none'
}

Write-Host "Using datasource URL: $($env:SPRING_DATASOURCE_URL)"
Write-Host "Using datasource username: $($env:SPRING_DATASOURCE_USERNAME)"

if ($UseMaven -or -not (Test-Path (Join-Path $PSScriptRoot 'target\medvault-0.0.1-SNAPSHOT.jar'))) {
    Write-Host "Building project with Maven..." -ForegroundColor Cyan
    & .\mvnw.cmd -DskipTests package
    if ($LASTEXITCODE -ne 0) {
        Write-Host "Maven build failed. Fix build errors and re-run." -ForegroundColor Red
        exit $LASTEXITCODE
    }
}

$jarPath = Join-Path $PSScriptRoot 'target\medvault-0.0.1-SNAPSHOT.jar'
if (-not (Test-Path $jarPath)) {
    Write-Host "Jar not found at $jarPath" -ForegroundColor Red
    exit 1
}

Write-Host "Starting backend and redirecting output to spring-boot-run.log" -ForegroundColor Green
# Start the jar and capture stdout/stderr to a log file in a robust way
$logPath = Join-Path $PSScriptRoot 'spring-boot-run.log'
if (Test-Path $logPath) { Remove-Item $logPath -Force }

# Run java and redirect both stdout and stderr into the log file
& java -jar $jarPath 2>&1 | Out-File -FilePath $logPath -Encoding UTF8

Write-Host 'Finished (or JVM exited). View logs with: Get-Content .\spring-boot-run.log -Tail 200 -Wait' -ForegroundColor Cyan
