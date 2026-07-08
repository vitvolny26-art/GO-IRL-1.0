param(
  [string]$Target = "",
  [switch]$Force,
  [switch]$SkipInstall,
  [switch]$SkipValidation
)

$ErrorActionPreference = "Stop"

$argsList = @("scripts/rebuild-go-irl-1-0.cjs")

if ($Target -ne "") {
  $argsList += "--target"
  $argsList += $Target
}

if ($Force) {
  $argsList += "--force"
}

if ($SkipInstall) {
  $argsList += "--skip-install"
}

if ($SkipValidation) {
  $argsList += "--skip-validation"
}

node @argsList
