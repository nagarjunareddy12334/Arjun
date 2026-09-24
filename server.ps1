$port = 8080
$prefix = "http://localhost:$port/"
$listener = New-Object System.Net.HttpListener
$listener.Prefixes.Add($prefix)

try {
    $listener.Start()
    Write-Output "Proposal server listening on $prefix"
} catch {
    Write-Output "Failed to bind to $port, trying 8081"
    $port = 8081
    $prefix = "http://localhost:$port/"
    $listener = New-Object System.Net.HttpListener
    $listener.Prefixes.Add($prefix)
    $listener.Start()
    Write-Output "Proposal server listening on $prefix"
}

$root = $PSScriptRoot

while ($listener.IsListening) {
    try {
        $context = $listener.GetContext()
        $request = $context.Request
        $response = $context.Response

        $urlPath = [System.Uri]::UnescapeDataString($request.Url.LocalPath)
        if ($urlPath -eq "/" -or [string]::IsNullOrEmpty($urlPath)) {
            $urlPath = "/index.html"
        }

        $localPath = Join-Path $root ($urlPath.TrimStart('/').Replace('/', '\'))

        if (Test-Path $localPath -PathType Leaf) {
            $ext = [System.IO.Path]::GetExtension($localPath).ToLower()
            $mime = switch ($ext) {
                ".html" { "text/html; charset=utf-8" }
                ".css"  { "text/css; charset=utf-8" }
                ".js"   { "application/javascript; charset=utf-8" }
                ".jpg"  { "image/jpeg" }
                ".jpeg" { "image/jpeg" }
                ".png"  { "image/png" }
                ".svg"  { "image/svg+xml" }
                ".mp4"  { "video/mp4" }
                ".webm" { "video/webm" }
                ".mp3"  { "audio/mpeg" }
                ".wav"  { "audio/wav" }
                Default { "application/octet-stream" }
            }
            $response.ContentType = $mime
            $response.AddHeader("Accept-Ranges", "bytes")
            $response.AddHeader("Access-Control-Allow-Origin", "*")

            $fileInfo = New-Object System.IO.FileInfo($localPath)
            $totalLength = $fileInfo.Length

            $rangeHeader = $request.Headers["Range"]
            if ($null -ne $rangeHeader -and $rangeHeader -match "bytes=(\d+)-(\d*)") {
                $start = [int64]$matches[1]
                $end = if ($matches[2]) { [int64]$matches[2] } else { $totalLength - 1 }
                if ($end -ge $totalLength) { $end = $totalLength - 1 }
                $length = $end - $start + 1

                $response.StatusCode = 206
                $response.AddHeader("Content-Range", "bytes $start-$end/$totalLength")
                $response.ContentLength64 = $length

                $fs = [System.IO.File]::OpenRead($localPath)
                try {
                    $fs.Seek($start, [System.IO.SeekOrigin]::Begin) | Out-Null
                    $buffer = New-Object byte[] 65536
                    $bytesRemaining = $length
                    while ($bytesRemaining -gt 0) {
                        $bytesToRead = [Math]::Min($buffer.Length, $bytesRemaining)
                        $bytesRead = $fs.Read($buffer, 0, $bytesToRead)
                        if ($bytesRead -le 0) { break }
                        $response.OutputStream.Write($buffer, 0, $bytesRead)
                        $bytesRemaining -= $bytesRead
                    }
                } finally {
                    $fs.Close()
                }
            } else {
                $response.StatusCode = 200
                $response.ContentLength64 = $totalLength
                $fs = [System.IO.File]::OpenRead($localPath)
                try {
                    $fs.CopyTo($response.OutputStream)
                } finally {
                    $fs.Close()
                }
            }
        } else {
            $response.StatusCode = 404
            $err = [System.Text.Encoding]::UTF8.GetBytes("404 Not Found: $urlPath")
            $response.OutputStream.Write($err, 0, $err.Length)
        }
        $response.Close()
    } catch {
        # continue loop
    }
}
