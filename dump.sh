#!/bin/bash
set -ex

# Extract full update
aria2c -x5 $1 -o ota.zip
unzip ota.zip payload.bin
mv payload.bin payload_working.bin
TAG="`unzip -p ota.zip payload_properties.txt | grep ^POST_OTA_VERSION= | cut -b 18-`"
BODY="`unzip -p ota.zip META-INF/com/android/metadata | grep ^post-build= | cut -b 12-`"
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
    BODY="`unzip -p ota.zip META-INF/com/android/metadata | grep ^post-build= | cut -b 12-`"
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

# Create a pseudo fastboot zip (split 2G, each separately compressed with zstd)
echo "board=taro" > ota/android-info.txt
cp prebuilt/super_empty.img ota/
mkdir out
cd ota
7z a -mx9 ../out/boot.img.zip boot.img &
7z a -mx9 ../out/vbmeta.img.zip vbmeta.img &
7z a -mx0 ../out/fastboot-${TAG}-image.zip *
wait
cd ..
rm -rf ota
cd out
7z a -v2G -mx0 fastboot-${TAG}-image-split.zip *-image.zip
rm *-image.zip
zstd --rm -T0 *-split.zip*

# Echo tag name and release body
echo "tag=$TAG" >> "$GITHUB_OUTPUT"
echo "body=$BODY" >> "$GITHUB_OUTPUT"
