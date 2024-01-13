# Nothing Phone (1) Archive

* Comprehensive Collection of Unmodified Stock OTA Images for Nothing Phone (1) 
* A personally maintained fork of [Nothing Archive by arter97](https://github.com/arter97/nothing_archive)


## Downloads

- Downloads are tagged with POST_OTA_VERSION & NothingOS version [here](https://github.com/spike0en/Spacewar_Archive/releases). Please note that certain early releases for `T1.5` may lack `POST_OTA_VERSION` information. In such instances, downloads are provided with custom names, such as `Spacewar_T1.5_XXXXXX-XXXX_NothingOS Version`.

- Logical partition images are uploaded separately, marked -logical,
  so that other images can be downloaded quickly if needed.


## Disclaimer

- While this is a collection of unmodified images, you still need to have the bootloader unlocked.

- You can re-lock the bootloader after flashing images.

- For further inquiries, discussions, and engaging content, users are encouraged to explore the [Nothing Phone (1) Telegram Community](https://t.me/NothingPhone1)

  
## Fastboot Flashing

- To flash the stock, unmodified images with fastboot, extract the files using 7z and
  use [Spacewar_fastboot_flasher](https://github.com/spike0en/Spacewar_fastboot_flasher).

- Please download and use the latest fastboot [directly from Google](https://developer.android.com/tools/releases/platform-tools).

- If you optionally want to have dm-verity disabled, perform:

``` bash
fastboot update --disable-verity --disable-verification vbmeta.img
```


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
- [luk1337](https://github.com/luk1337/oplus_archive)
- [arter97](https://github.com/arter97/nothing_archive)
