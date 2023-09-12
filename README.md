# Nothing Phone 2 archive
* Unmodified Nothing Phone 2 OTA images archive

## Downloads
Downloads are tagged with `POST_OTA_VERSION`, NothingOS version and region, [here](https://github.com/arter97/nothing_archive/releases).

## Usage
While this is a collection of unmodified images, you still need to have the bootloader unlocked.

Please download and use the latest fastboot [directly from Google](https://developer.android.com/tools/releases/platform-tools).

 * **Magisk**

 If you're interested in just rooting your device, download `boot.img.zip` and `vbmeta.img.zip`. After extracting both zip files, push `boot.img` to your device and proceed with Magisk installation. Optionally, if you want to disable `dm-verity`, use fastboot to flash a modified vbmeta:

 ``` bash
 fastboot flash --disable-verity --disable-verification vbmeta vbmeta.img
 ```

 * **fastboot**

To flash the stock, unmodified images with fastboot, extract the `*.zst` files using zstd and extract the split zip files using 7z, and supply the final `fastboot-*-image.zip` to fastboot.

``` bash
fastboot update /path/to/fastboot-*-image.zip
```

or if you want to have `dm-verity` disabled:

``` bash
fastboot update --disable-verity --disable-verification /path/to/fastboot-*-image.zip
```

### Thanks to
[luk1337](https://github.com/luk1337/oplus_archive)