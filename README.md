# Nothing Phone (1) Archive

* A comprehensive collection of unmodified Full OTA update packages & stock OTA images for Nothing Phone (1).


## Downloads

- Downloads are tagged with POST_OTA_VERSION & NothingOS version [here](https://github.com/spike0en/Spacewar_Archive/releases). Please note that certain early releases for `T1.5` may lack `POST_OTA_VERSION` information. In such instances, downloads are provided with custom names, such as `Spacewar_T1.5_XXXXXX-XXXX_NothingOS Version`.

- Official Full OTA Update Package is marked `-FullOTA`. Extract the splitted 7z parts to get the `<name>-FullOTA.zip`.

- The Stock OTA image files are categorized and archived in .7z format based on `boot`, `logical`, and `firmware` partitions:

### Boot Partition (marked `-image-boot.7z`)

Includes 3 images:
```bash
boot, vendor_boot & vbmeta
```
### Logical partition (marked `-image-logical.7z.001-003`)

Includes 6 images:
```bash
system, system_ext, product, vendor, odm, vbmeta_system & vbmeta_vendor
```
### Firmware partition (marked `-image-firmware.7z`)

Includes 19 images:
```bash
abl, aop, bluetooth, cpucp, devcfg, dsp, dtbo, featenabler, hyp, imagefv, keymaster, modem, multiimgoem, qupfw, shrm, tz, uefisecapp, xbl & xbl_config
```

## Disclaimer

- While this is a collection of unmodified images, you still need to have the bootloader unlocked.

- You can re-lock the bootloader after flashing images.

- SHA-1 hash of `<name>-FullOTA.zip` file has been provided. It is to be noted that the built-in NothingOS Offline Updater Tool autonomously verifies file integrity. It initiates the update process only if the file aligns with the hash values specified in `payload-properties.txt`, which is obtained during the creation of the update package.

- For further inquiries, discussions, and engaging content, users are encouraged to explore the [Nothing Phone (1) Telegram Community](https://t.me/NothingPhone1)
  
## Fastboot Flashing

- To flash the stock, unmodified images with fastboot, extract the files using 7z and
  use [Spacewar_fastboot_flasher](https://github.com/spike0en/Spacewar_fastboot_flasher).

- Please download and use the latest fastboot [directly from Google](https://developer.android.com/tools/releases/platform-tools).

- If you optionally want to have dm-verity disabled, perform:

``` bash
fastboot update --disable-verity --disable-verification vbmeta.img
```

## Manual Sideloading of Full OTA Packages

### A. Via Stock Nothing Offline OTA Updater Tool (Locked BL): 

1. To flash stock, unmodified official Full OTA packages, extract the files using 7z to obtain the <name>-FullOTA.zip file.
2. Using your preferred file manager, create a folder named 'ota' at the root of your storage.
3. Copy the <name>-FullOTA.zip into the newly created 'ota' folder.
4. Open your dial pad and type `*#*#682#*#*`.
5. The manual update utility will launch, scanning and locating your previously downloaded update file.
6. Tap to begin the update. The process will take about 10-15 minutes (duration may vary).
7. Enjoy your updated device after reboot!

### B. Via Custom Recovery (Unlocked BL):

- Alternatively, users can directly flash these full OTA packages using available custom recoveries for Nothing Phone (1).


## Integrity Check

- You can check the downloaded file's integrity with one of the following commands (for logical):

``` bash
md5sum -c *-hash.md5
sha1sum -c *-hash.sha1
sha256sum -c *-hash.sha256
xxh128sum -c *-hash.xxh128
```

- xxh128 is usually the fastest.


### Thanks to
- [luk1337](https://github.com/luk1337/oplus_archive) & [arter97](https://github.com/arter97/nothing_archive) for their great work!
- [LukeSkyD](https://github.com/LukeSkyD) for ota link captures.