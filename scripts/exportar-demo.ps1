# exportar-demo.ps1 — Regenera public/demo/<app> (rendapps.cl/demo): la web de la app
# exportada bajo /demo/<app>, con los datos de prueba de public/demo/comun delante.
# Uso: powershell -ExecutionPolicy Bypass -File scripts\exportar-demo.ps1 -Cual leadyx|gatheryx
# Las rutas de los repos son las del PC prestado (Documents\Rendapps): ajustarlas en otro PC.
param([string]$Cual)
# Exporta la web de una app bajo /demo/<app> y la deja en Pagina web/public/demo/<app>,
# con los scripts de la demo delante de la app.
$ErrorActionPreference = 'Stop'
$repos = @{
  leadyx   = 'C:\Users\jasan\Documents\Rendapps\Capturador de leads\capturador-leads'
  gatheryx = 'C:\Users\jasan\Documents\Rendapps\Registro pro eventos\registro-pro-eventos'
}
$repo = $repos[$Cual]
$tmp = Join-Path $env:TEMP "rendapps-demo-$Cual"
$destino = "C:\Users\jasan\Documents\Rendapps\Pagina web\public\demo\$Cual"
if (Test-Path $tmp) { Remove-Item $tmp -Recurse -Force }
$env:EXPO_DEMO_BASE = "/demo/$Cual"
Push-Location $repo
try {
  cmd /c "npx expo export --platform web --clear --output-dir `"$tmp`""
  if ($LASTEXITCODE -ne 0) { throw "expo export falló ($LASTEXITCODE)" }
} finally { Pop-Location; Remove-Item Env:\EXPO_DEMO_BASE }

# assets/node_modules -> assets/nm (git y algunos servidores ignoran esa carpeta).
$nm = Join-Path $tmp 'assets\node_modules'
if (Test-Path $nm) { Rename-Item $nm 'nm' }
$u = New-Object Text.UTF8Encoding($false)
$scripts = "<script src=`"/demo/comun/demo-supabase.js`"></script><script src=`"/demo/comun/demo-$Cual.js`"></script>"
Get-ChildItem $tmp -Recurse -File -Include *.js,*.html,*.json,*.css | ForEach-Object {
  $t = [IO.File]::ReadAllText($_.FullName)
  $n = $t.Replace('assets/node_modules/', 'assets/nm/')
  if ($_.Extension -eq '.html') {
    $n = [regex]::Replace($n, '<head>', "<head>$scripts", 1)
    $n = $n.Replace('<title>', '<title>Demo &middot; ')
  }
  if ($n -ne $t) { [IO.File]::WriteAllText($_.FullName, $n, $u) }
}
if (Test-Path $destino) { Remove-Item $destino -Recurse -Force }
Copy-Item $tmp $destino -Recurse
$mb = [math]::Round(((Get-ChildItem $destino -Recurse -File | Measure-Object Length -Sum).Sum / 1MB), 1)
"$Cual listo en $destino ($mb MB)"
