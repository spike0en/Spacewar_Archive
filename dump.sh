#!/bin/bash
set -ex

# Extract full update
aria2c -x5 $1 -o ota.zip
unzip ota.zip payload.bin
mv payload.bin payload_working.bin
TAG="`unzip -p ota.zip payload_properties.txt | grep ^POST_OTA_VERSION= | cut -b 18-`"
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
    TAG="`unzip -p ota.zip payload_properties.txt | grep ^POST_OTA_VERSION= | cut -b 18-`"
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

# Create a split 7z image
mkdir out
mkdir dyn
cd ota
# Calculate hash
for h in md5 sha1 sha256; do
  ls * | parallel openssl dgst -$h -r | sort -k2 -V > ../out/${TAG}-hash.$h &
done
ls * | parallel xxh128sum | sort -k2 -V > ../out/${TAG}-hash.xxh128 &
wait
for f in system system_ext product vendor vendor_dlkm odm; do
    mv ${f}.img ../dyn
done
7z a -mx6 ../out/${TAG}-image.7z * &
cd ../dyn
7z a -mx6 -v1g ../out/${TAG}-image-logical.7z *
wait
cd ..
rm -rf ota dyn

# Echo tag name and release body
echo "tag=$TAG" >> "$GITHUB_OUTPUT"
echo "body=$BODY" >> "$GITHUB_OUTPUT"
