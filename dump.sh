#!/bin/bash
# Script has been modified by Spike for additional functionality and clarity, originally by arter97 and luk1337.

# Set execute permissions for ota_extractor
chmod +x ./bin/ota_extractor

# Download base ota package with aria2c or gdown based on link format while renaming it to ota.zip
download_with_gdown() {
    gdown --fuzzy "$url" -O ota.zip
}

download_with_aria2c() {
    aria2c -x5 "$1" -o ota.zip
}

download_file() {
    local url="$1"

    if [[ "$url" == *"drive.google.com"* ]]; then
        download_with_gdown "$url"
    else
        download_with_aria2c "$url"
    fi
}

# Call download_file function with the provided URL
download_file "$1"

# Create a new folder 'fullota' and copy ota.zip to it
mkdir fullota
cp ota.zip fullota

# Continue with unzipping and extracting the payload
unzip ota.zip payload.bin
mv payload.bin payload_working.bin
TAG="`unzip -p ota.zip payload_properties.txt | grep ^POST_OTA_VERSION= | cut -b 18-`"
BODY="[$TAG]($1) (full)"
rm ota.zip
mkdir ota

# Perform extraction on payload_working.bin
./bin/ota_extractor -output_dir ota -payload payload_working.bin

# Apply incrementals
for i in "${@:2}"; do
    download_file "$i"
    unzip ota.zip payload.bin
    mv payload.bin payload_working.bin
    TAG="`unzip -p ota.zip payload_properties.txt | grep ^POST_OTA_VERSION= | cut -b 18-`"
    BODY="$BODY -> [$TAG]($i)"
    rm ota.zip

    mkdir ota_new
    ./bin/ota_extractor -input-dir ota -output_dir ota_new -payload payload_working.bin

    rm -rf ota
    mv ota_new ota

    rm payload_working.bin
done

# Create necessary folders to be used later (`dyn` for logical images and `syn` for boot partition images)
mkdir out dyn syn

# Switch back to `ota` directory
cd ota

# Calculate the hashes for all files in the `ota` directory and send them to `out` (tagged with `-hash`)
for h in md5 sha1 sha256 xxh128; do
    if [ "$h" = "xxh128" ]; then
        ls * | parallel xxh128sum | sort -k2 -V > ../out/${TAG}-hash.$h
    else
        ls * | parallel "openssl dgst -${h} -r" | sort -k2 -V > ../out/${TAG}-hash.${h}
    fi
done

# Move specific boot partition image files from `ota` to `syn` directory
for f in boot vendor_boot vbmeta; do
    mv ${f}.img ../syn
done

# Switch to `ota` directory and move specific logical partition image files from `ota` to `dyn` directory
cd ../ota
for f in system system_ext product vendor odm vbmeta_system; do
    mv ${f}.img ../dyn
done

# Switch to `syn` directory and create a 7z archive for boot partition images tagged with "-boot"
cd ../syn
7z a -mmt4 -mx6 ../out/${TAG}-image-boot.7z *
rm -rf ../syn

# Switch to `ota` directory and create a 7z archive for firmware images tagged with "-firmware"
cd ../ota
7z a -mmt4 -mx6 ../out/${TAG}-image-firmware.7z *
rm -rf ../ota

# Switch to `dyn` directory and create a split 7z archive for logical images tagged with "-logical"
cd ../dyn
7z a -mmt4 -mx6 -v1g ../out/${TAG}-image-logical.7z *
wait
rm -rf ../dyn

# Switch to `fullota` directory
cd ../fullota

# Copy ota.zip and rename it to ${TAG}-FullOTA.zip
cp ota.zip "./${TAG}-FullOTA.zip"

# Calculate SHA-1 hash for the FullOTA file and send them to `out` (tagged with `-FullOTA-hash`)
SHA1_HASH=$(openssl dgst -sha1 -r "${TAG}-FullOTA.zip" | cut -d ' ' -f 1)
echo "${SHA1_HASH}" > "../out/${TAG}-FullOTA-hash.sha1"

# Create a split 7z archive for the base FullOTA Package
7z a -mmt4 -mx6 -v1g "../out/${TAG}-FullOTA.7z" "${TAG}-FullOTA.zip"
rm -rf ../fullota

# Echo tag name, release body, and release history
echo "tag=$TAG" >> "$GITHUB_OUTPUT"
echo "body=$BODY" >> "$GITHUB_OUTPUT"