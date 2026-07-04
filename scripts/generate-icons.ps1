Add-Type -AssemblyName System.Drawing

function New-Icon($size, $path) {
    $bmp = New-Object System.Drawing.Bitmap $size, $size
    $g = [System.Drawing.Graphics]::FromImage($bmp)
    $g.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::AntiAlias
    $g.TextRenderingHint = [System.Drawing.Text.TextRenderingHint]::AntiAliasGridFit

    $navy = [System.Drawing.Color]::FromArgb(255, 30, 58, 95)
    $g.Clear($navy)

    $white = New-Object System.Drawing.SolidBrush ([System.Drawing.Color]::White)
    $fontSize = [float]($size * 0.20)
    $font = New-Object System.Drawing.Font("Malgun Gothic", $fontSize, [System.Drawing.FontStyle]::Bold)

    $sf = New-Object System.Drawing.StringFormat
    $sf.Alignment = [System.Drawing.StringAlignment]::Center
    $sf.LineAlignment = [System.Drawing.StringAlignment]::Center

    $rect = New-Object System.Drawing.RectangleF(0, 0, $size, $size)
    $text = "금수`n판매"
    $g.DrawString($text, $font, $white, $rect, $sf)

    $bmp.Save($path, [System.Drawing.Imaging.ImageFormat]::Png)
    $g.Dispose()
    $bmp.Dispose()
}

$dir = Join-Path $PSScriptRoot "..\public\icons"
New-Icon 192 (Join-Path $dir "icon-192.png")
New-Icon 512 (Join-Path $dir "icon-512.png")
