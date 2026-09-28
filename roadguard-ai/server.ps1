# RoadGuard AI - Built-in Lightweight Localhost Web Server
# Allows browsers (Chrome, Edge, Brave) to enable real live GPS hardware location permissions
$port = 8080
$rootDir = $PSScriptRoot

$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add("http://localhost:$port/")

try {
    $listener.Start()
    Write-Host "============================================================" -ForegroundColor Cyan
    Write-Host " RoadGuard AI - Local Secure Server Running" -ForegroundColor Green
    Write-Host " URL: http://localhost:$port/index.html" -ForegroundColor Yellow
    Write-Host " Real Device GPS Permissions: ENABLED" -ForegroundColor Green
    Write-Host " Press Ctrl+C in this window to stop the server" -ForegroundColor Gray
    Write-Host "============================================================" -ForegroundColor Cyan

    Start-Process "http://localhost:$port/index.html"

    while ($listener.IsListening) {
        $context = $listener.GetContext()
        $req = $context.Request
        $res = $context.Response

        $localPath = $req.Url.LocalPath.TrimStart('/')
        if ([string]::IsNullOrWhiteSpace($localPath)) {
            $localPath = "index.html"
        }

        # Prevent path traversal
        $fullPath = [System.IO.Path]::GetFullPath([System.IO.Path]::Combine($rootDir, $localPath))
        if ($fullPath.StartsWith($rootDir) -and (Test-Path $fullPath -PathType Leaf)) {
            $ext = [System.IO.Path]::GetExtension($fullPath).ToLower()
            switch ($ext) {
                ".html" { $res.ContentType = "text/html; charset=utf-8" }
                ".js"   { $res.ContentType = "application/javascript; charset=utf-8" }
                ".css"  { $res.ContentType = "text/css; charset=utf-8" }
                ".png"  { $res.ContentType = "image/png" }
                ".jpg"  { $res.ContentType = "image/jpeg" }
                ".jpeg" { $res.ContentType = "image/jpeg" }
                ".svg"  { $res.ContentType = "image/svg+xml" }
                ".json" { $res.ContentType = "application/json; charset=utf-8" }
                default { $res.ContentType = "application/octet-stream" }
            }

            # Enable CORS and disable caching during dev
            $res.AddHeader("Access-Control-Allow-Origin", "*")
            $res.AddHeader("Cache-Control", "no-cache, no-store, must-revalidate")

            $bytes = [System.IO.File]::ReadAllBytes($fullPath)
            $res.ContentLength64 = $bytes.Length
            $res.OutputStream.Write($bytes, 0, $bytes.Length)
        } else {
            $res.StatusCode = 404
            $errBytes = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $localPath")
            $res.ContentLength64 = $errBytes.Length
            $res.OutputStream.Write($errBytes, 0, $errBytes.Length)
        }

        $res.OutputStream.Close()
    }
} catch {
    Write-Error "Server error: $_"
} finally {
    if ($listener.IsListening) {
        $listener.Stop()
    }
    $listener.Close()
}
