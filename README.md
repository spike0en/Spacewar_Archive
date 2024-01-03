# Nothing Phone 2 archive
* Unmodified Nothing Phone 2 OTA images archive

## Downloads
Downloads are tagged with `POST_OTA_VERSION`, NothingOS version,
[here](https://github.com/arter97/nothing_archive/releases).

Logical partition images are uploaded separately, marked `-logical`,
so that other images can be downloaded quickly if needed.

## Usage
While this is a collection of unmodified images, you still need to have the bootloader unlocked.

You can re-lock the bootloader after flashing images.

Please download and use the latest fastboot [directly from Google](https://developer.android.com/tools/releases/platform-tools).

 * **fastboot**

To flash the stock, unmodified images with fastboot, extract the files using 7z and
use [Pong_fastboot_flasher](https://github.com/HELLBOY017/Pong_fastboot_flasher).

If you optionally want to have `dm-verity` disabled, perform:

``` bash
fastboot update --disable-verity --disable-verification vbmeta.img
```

 * **NothingMuchROM**

You can use this repository to flash non-super partitions to the latest stock to be
used with [NothingMuchROM](https://xdaforums.com/t/nothingmuchrom-for-nothing-phone-2.4623411).

Skip downloading `-logical` files, and follow the above steps but answer "N" to
`Flash logical partition images?` during [Pong_fastboot_flasher](https://github.com/HELLBOY017/Pong_fastboot_flasher)'s
installation.

## Integrity check
You can check downloaded file's integrity with one the following commands:

``` bash
md5sum -c *-hash.md5
sha1sum -c *-hash.sha1
sha256sum -c *-hash.sha256
xxh128sum -c *-hash.xxh128
```

xxh128 is usually the fastest.

### Thanks to
[luk1337](https://github.com/luk1337/oplus_archive)
