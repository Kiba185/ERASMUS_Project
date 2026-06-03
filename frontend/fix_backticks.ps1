$files = Get-ChildItem -Path "src" -Recurse -Include "*.tsx","*.ts"

foreach ($file in $files) {
    $content = Get-Content $file.FullName -Raw -Encoding UTF8
    
    # Replace single-quoted '${API_URL}/...' with backtick-quoted `${API_URL}/...`
    # Pattern: '${API_URL}/something'
    $newContent = $content -replace "'(\`$\{API_URL\}[^']*)'", '`$1`'
    
    if ($newContent -ne $content) {
        Set-Content -Path $file.FullName -Value $newContent -NoNewline -Encoding UTF8
        Write-Host "Fixed: $($file.Name)"
    }
}
Write-Host "Done."
