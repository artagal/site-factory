param(
  [string]$ExportPath = (Join-Path $PSScriptRoot '../gofunmotion-ffai/generated_code')
)

$ErrorActionPreference = 'Stop'
$root = (Resolve-Path -LiteralPath $ExportPath).Path
$checks = [System.Collections.Generic.List[object]]::new()

function Add-Check([string]$Name, [bool]$Passed, [string]$NextStep) {
  $checks.Add([pscustomobject]@{ Check = $Name; Passed = $Passed; NextStep = $(if ($Passed) { '' } else { $NextStep }) })
}

function Read-Plist([string]$Path) {
  if (!(Test-Path -LiteralPath $Path)) { return $null }
  return [xml](Get-Content -LiteralPath $Path -Raw)
}

function Plist-String($Xml, [string]$Key) {
  if ($null -eq $Xml) { return '' }
  $node = $Xml.SelectSingleNode("/plist/dict/key[text()='$Key']/following-sibling::*[1]")
  if ($null -eq $node) { return '' }
  return $node.InnerText
}

$iosConfig = Read-Plist (Join-Path $root 'ios/Runner/GoogleService-Info.plist')
$info = Read-Plist (Join-Path $root 'ios/Runner/Info.plist')
$entitlements = Read-Plist (Join-Path $root 'ios/Runner/Runner.entitlements')
$xcodeProject = Get-Content -LiteralPath (Join-Path $root 'ios/Runner.xcodeproj/project.pbxproj') -Raw
Add-Check 'iOS bundle ID' ($xcodeProject.Contains('com.gofunmotion.app') -and !$xcodeProject.Contains('com.mycompany.gofunmotion')) 'Set com.gofunmotion.app in FlutterFlow before exporting.'
Add-Check 'iOS Firebase file' ($null -ne $iosConfig) 'Upload the existing GoogleService-Info.plist in FlutterFlow Firebase settings and export again.'
Add-Check 'iOS Firebase identity' ((Plist-String $iosConfig 'BUNDLE_ID') -eq 'com.gofunmotion.app' -and (Plist-String $iosConfig 'PROJECT_ID') -eq 'gofunmotion-prod') 'Use the registered gofunmotion-prod iOS app, not another project.'
$reversedClientId = Plist-String $iosConfig 'REVERSED_CLIENT_ID'
$schemes = if ($null -ne $info) { @($info.SelectNodes("/plist/dict/key[text()='CFBundleURLTypes']/following-sibling::array[1]/dict/key[text()='CFBundleURLSchemes']/following-sibling::array[1]/string") | ForEach-Object InnerText) } else { @() }
Add-Check 'Google iOS callback scheme' ($reversedClientId.Length -gt 0 -and $schemes -contains $reversedClientId) 'Regenerate Firebase config in Builder; verify the reversed Google client ID in the fresh Info.plist.'
Add-Check 'Sign in with Apple entitlement' ((Plist-String $entitlements 'com.apple.developer.applesignin') -eq 'Default') 'Enable Sign in with Apple in Builder and the Apple Developer App ID.'

$iosIconPath = Join-Path $root 'ios/Runner/Assets.xcassets/AppIcon.appiconset/Icon-App-1024x1024@1x.png'
$androidIconPath = Join-Path $root 'android/app/src/main/res/mipmap-xxxhdpi/ic_launcher.png'
$flutterDefaultIosIcon = '7770183009E914112DE7D8EF1D235A6A30C5834424858E0D2F8253F6B8D31926'
$flutterDefaultAndroidIcon = '3C34E1F298D0C9EA3455D46DB6B7759C8211A49E9EC6E44B635FC5C87DFB4180'
$iosIconHash = if (Test-Path -LiteralPath $iosIconPath) { (Get-FileHash -Algorithm SHA256 -LiteralPath $iosIconPath).Hash } else { '' }
$androidIconHash = if (Test-Path -LiteralPath $androidIconPath) { (Get-FileHash -Algorithm SHA256 -LiteralPath $androidIconPath).Hash } else { '' }
Add-Check 'Branded iOS launcher icon' ($iosIconHash.Length -gt 0 -and $iosIconHash -ne $flutterDefaultIosIcon) 'Regenerate the export after FlutterFlow finishes processing the selected GoFunMotion launcher icon.'
Add-Check 'Branded Android launcher icon' ($androidIconHash.Length -gt 0 -and $androidIconHash -ne $flutterDefaultAndroidIcon) 'Regenerate the export after FlutterFlow finishes processing the selected GoFunMotion launcher icon.'

$androidPath = Join-Path $root 'android/app/google-services.json'
$android = if (Test-Path -LiteralPath $androidPath) { Get-Content -LiteralPath $androidPath -Raw | ConvertFrom-Json } else { $null }
$packages = @($android.client | ForEach-Object { $_.client_info.android_client_info.package_name })
Add-Check 'Android Firebase identity' ($null -ne $android -and $android.project_info.project_id -eq 'gofunmotion-prod' -and $packages -contains 'com.gofunmotion.app') 'Upload the existing google-services.json in FlutterFlow and verify package identity.'

$authManager = Get-Content -LiteralPath (Join-Path $root 'lib/auth/firebase_auth/firebase_auth_manager.dart') -Raw
Add-Check 'Canonical profile sync' (!$authManager.Contains('await maybeCreateUser(')) 'Disable native snake_case user creation; use SyncMobileAccount after successful auth.'
$api = Get-Content -LiteralPath (Join-Path $root 'lib/backend/api_requests/api_calls.dart') -Raw
Add-Check 'AI JSON escaping' ($api.Contains('escapeStringForJson(query)') -and $api.Contains('escapeStringForJson(planJson)')) 'Run the API encoding migration and refresh the generated snapshot.'
$secretMatches = @(Get-ChildItem -LiteralPath (Join-Path $root 'lib') -Recurse -Filter '*.dart' | Select-String -Pattern 'sk-(?:proj-)?[A-Za-z0-9_-]{25,}')
Add-Check 'No embedded provider secret' ($secretMatches.Count -eq 0) 'Remove any provider key from the mobile project and rotate it. Keep it in Vercel only.'

$pubspec = Get-Content -LiteralPath (Join-Path $root 'pubspec.yaml') -Raw
$storeActionPath = Join-Path $root 'lib/custom_code/actions/go_fun_motion_store_subscription.dart'
$subscriptionPagePath = Join-Path $root 'lib/partner/partner_subscription_page/partner_subscription_page_widget.dart'
$storeAction = if (Test-Path -LiteralPath $storeActionPath) { Get-Content -LiteralPath $storeActionPath -Raw } else { '' }
$subscriptionPage = if (Test-Path -LiteralPath $subscriptionPagePath) { Get-Content -LiteralPath $subscriptionPagePath -Raw } else { '' }
$nativeBillingReady = $pubspec.Contains('purchases_flutter: 9.9.5') `
  -and $storeAction.Contains('Purchases.purchase(PurchaseParams.package') `
  -and $storeAction.Contains('Purchases.restorePurchases()') `
  -and $subscriptionPage.Contains('if (_model.storeReady == true)') `
  -and $subscriptionPage.Contains('if (_model.storeState?.canGrowth == true)') `
  -and $subscriptionPage.Contains('if (_model.storeState?.canPro == true)')
Add-Check 'Native partner subscription flow' $nativeBillingReady 'Refresh FlutterFlow codegen and verify the fail-closed RevenueCat purchase and restore flow.'

$checks | Format-Table -AutoSize -Wrap
Write-Output 'This static check does not verify Apple signing, Firebase provider enablement, device auth, backend deployment, account deletion, or a TestFlight upload.'
if (@($checks | Where-Object { !$_.Passed }).Count -gt 0) { exit 1 }
