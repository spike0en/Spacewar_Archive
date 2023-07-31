#!/bin/bash
set -ex

# Extract full update
curl -L $1 -o ota.zip
unzip ota.zip payload.bin
BODY="[`unzip -p ota.zip META-INF/com/android/metadata | grep ^version_name= | cut -b 14-`]($1) (full)"
rm ota.zip
mkdir ota
./bin/ota_extractor -output_dir ota -payload payload.bin
rm payload.bin

# Apply incrementals
for i in ${@:2}; do
    curl -L $i -o ota.zip
    unzip ota.zip payload.bin
    TAG="`unzip -p ota.zip META-INF/com/android/metadata | grep ^version_name= | cut -b 14-`"
    BODY="$BODY -> [$TAG]($i)"
    rm ota.zip

    mkdir ota_new
    ./bin/ota_extractor -input-dir ota -output_dir ota_new -payload payload.bin

    rm -rf ota
    mv ota_new ota

    rm payload.bin
done

# Compress with zstd
for f in ota/*; do
    zstd --rm "$f"
done

# Echo tag name and release body
echo "tag=$TAG" >> "$GITHUB_OUTPUT"
echo "body=$BODY" >> "$GITHUB_OUTPUT"
