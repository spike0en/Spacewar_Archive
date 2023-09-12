#!/bin/bash
set -ex

# Extract full update
aria2c -x5 $1 -o ota.zip
unzip ota.zip payload.bin
mv payload.bin payload_working.bin
TAG="`unzip -p ota.zip META-INF/com/android/metadata | grep ^version_name= | cut -b 14-`"
BODY="[$TAG]($1) (full)"
rm ota.zip
mkdir ota
(
    ./bin/ota_extractor -output_dir ota -payload payload_working.bin
    rm payload_working.bin
) & # Allow subsequent downloads to be done in parallel

# Apply incrementals
for i in ${@:2}; do
    aria2c -x5 $i -o ota.zip
    unzip ota.zip payload.bin
    wait
    mv payload.bin payload_working.bin
    TAG="`unzip -p ota.zip META-INF/com/android/metadata | grep ^version_name= | cut -b 14-`"
    BODY="$BODY -> [$TAG]($i)"
    rm ota.zip

    (
        mkdir ota_new
        ./bin/ota_extractor -input-dir ota -output_dir ota_new -payload payload_working.bin

        rm -rf ota
        mv ota_new ota

        rm payload_working.bin
    ) & # Allow subsequent downloads to be done in parallel
done
wait

# Compress with zstd
zstd --rm ota/*

# Echo tag name and release body
echo "tag=$TAG" >> "$GITHUB_OUTPUT"
echo "body=$BODY" >> "$GITHUB_OUTPUT"
