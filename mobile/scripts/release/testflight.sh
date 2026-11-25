#!/usr/bin/env bash
# Archive the iOS app and upload it to App Store Connect (TestFlight) with Xcode's signed-in account.
# Owner-run only. Needs mobile/.env.production (EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_…) and a bumped
# expo.ios.buildNumber in app.json for every upload after the first.
set -euo pipefail
cd "$(dirname "$0")/../.."

[[ -f .env.production ]] || { echo "missing mobile/.env.production (App Store RevenueCat key)"; exit 1; }
grep -q '^EXPO_PUBLIC_REVENUECAT_IOS_KEY=appl_' .env.production || { echo ".env.production needs an appl_ RevenueCat key"; exit 1; }

BUILD=$(node -p "require('./app.json').expo.ios.buildNumber")
ARCHIVE="$HOME/Library/Developer/Xcode/Archives/$(date +%F)/Flick build $BUILD.xcarchive"

CI=1 pnpm expo prebuild --platform ios
xcodebuild archive -workspace ios/Flick.xcworkspace -scheme Flick -configuration Release \
  -destination "generic/platform=iOS" -archivePath "$ARCHIVE" -allowProvisioningUpdates -quiet
xcodebuild -exportArchive -archivePath "$ARCHIVE" -exportOptionsPlist scripts/release/ExportOptions.plist \
  -exportPath "$(mktemp -d)" -allowProvisioningUpdates
echo "Uploaded Flick build $BUILD. It appears in TestFlight after Apple finishes processing."
