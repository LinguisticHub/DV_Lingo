# Function to upscale and improve quality settings
Add-Type -AssemblyName System.Drawing

function Enhance-Image {
    param (
        [string]$FilePath,
        [double]$Scale = 1.25,
        [int]$Quality = 95
    )

    if (Test-Path $FilePath) {
        Write-Host "Enhancing $FilePath..."
        $fullPath = Resolve-Path $FilePath
        
        try {
            $img = [System.Drawing.Image]::FromFile($fullPath)
            
            # Calculate new size
            $newWidth = [int]($img.Width * $Scale)
            $newHeight = [int]($img.Height * $Scale)
            
            # Create new bitmap
            $newBitmap = New-Object System.Drawing.Bitmap($newWidth, $newHeight)
            $graph = [System.Drawing.Graphics]::FromImage($newBitmap)
            
            # High Quality settings
            $graph.InterpolationMode = [System.Drawing.Drawing2D.InterpolationMode]::HighQualityBicubic
            $graph.SmoothingMode = [System.Drawing.Drawing2D.SmoothingMode]::HighQuality
            $graph.PixelOffsetMode = [System.Drawing.Drawing2D.PixelOffsetMode]::HighQuality
            $graph.CompositingQuality = [System.Drawing.Drawing2D.CompositingQuality]::HighQuality

            $graph.DrawImage($img, 0, 0, $newWidth, $newHeight)
            $img.Dispose()
            $img = $newBitmap
            $graph.Dispose()
            Write-Host "  Upscaled to width: $newWidth"

            # Encoder parameters for compression quality
            $encoder = [System.Drawing.Imaging.Encoder]::Quality
            $encoderParams = New-Object System.Drawing.Imaging.EncoderParameters(1)
            $encoderParams.Param[0] = New-Object System.Drawing.Imaging.EncoderParameter($encoder, $Quality)
            
            # Get Codec
            $ext = [System.IO.Path]::GetExtension($FilePath).ToLower()
            $mime = "image/jpeg"
            if ($ext -eq ".png") { $mime = "image/png" } # PNG ignores Quality mostly but we keep param
            $codec = [System.Drawing.Imaging.ImageCodecInfo]::GetImageEncoders() | Where-Object { $_.MimeType -eq $mime }
            
            # Save to temp file
            $tempPath = "$fullPath.tmp$ext"
            $img.Save($tempPath, $codec, $encoderParams)
            $img.Dispose()
            
            # Replace
            Move-Item -Path $tempPath -Destination $fullPath -Force
            Write-Host "  Saved enhanced file."
        }
        catch {
            Write-Host "  Error processing $FilePath : $_"
        }
    }
    else {
        Write-Host "  File not found: $FilePath"
    }
}

# 1. Enhance BONA.PNG (Scale up 1.5x)
Enhance-Image -FilePath "images/bona.png" -Scale 1.5 -Quality 95

# 2. Enhance Backgrounds (Scale up 1.3x)
$bgs = Get-ChildItem "images/background-*.jpg"
foreach ($bg in $bgs) {
    Enhance-Image -FilePath $bg.FullName -Scale 1.3 -Quality 95
}
