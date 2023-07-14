#!/bin/bash
set -ex

# Extract full update
curl -L $1 -o ota.zip
./payload-dumper-go -o ota ota.zip > /dev/null
BODY="[`unzip -p ota.zip META-INF/com/android/metadata | grep ^version_name= | cut -b 14-`]($1}) (full)"
rm ota.zip

# Drop .img suffix from images
for i in ota/*.img; do
    mv -i "$i" "${i%.img}"
done

# Apply incrementals
for i in ${@:2}; do
    curl -L $i -o ota.zip
    unzip ota.zip payload.bin
    TAG="`unzip -p ota.zip META-INF/com/android/metadata | grep ^version_name= | cut -b 14-`"
    BODY="$BODY -> [$TAG]($i)"
    rm ota.zip

    pushd update_payload_extractor
    ./extract.py --skip_hash --output_dir ../ota_new --old_dir ../ota ../payload.bin
    popd

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
