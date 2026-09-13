---
sidebar_position: 4
title: Guides
pagination_prev: changelogs/index
description: Technical guides for OTA sideloading, dialer codes, bootloader unlocking, rooting, partition backups, custom ROMs, and unbricking.
---

# How-to Guides

Step-by-step procedures for Nothing OS configuration, maintenance, and modification.

## General Use & Troubleshooting

### OTA Sideloading

:::note

- Bootloader unlocking is not mandatory to sideload incremental OTA updates. Skip Step A unless you are a rooted user.
- Sideloading official incremental or full OTA updates is safe as long as they are downloaded directly from this archive.
- Do not use third-party sources. All firmware in the Nothing Archive is sourced directly from Nothing's official OEM servers.  
  This can be verified by inspecting the download URL(s) in the incremental OTA section, which point to official server and not third-party file hosts.
- The built-in Nothing OS offline updater only accepts OEM-signed update packages.
- The updater verifies the firmware hash before installation and will fail if an incorrect or mismatched OTA zip is used.
- The same verification applies to full OTA packages; they will not install unless their integrity is intact.
- Because of these checks, it is not possible to brick your device by sideloading an official OTA zip on a locked bootloader.
- For Open Beta Test updates, sideload them via `Nothing Beta Updater Hub` (name might change in future) provided by the OEM if the dialer method does not work
  You can launch the interface from Settings. This happens when you have installed the OEM's beta updater app which overrides the stock inbuilt version.
- For visual references, see the images [sideloading images](https://github.com/spike0en/nothing_archive/tree/main/assets/sideloading) in the listed order.

:::

<br />

A. **Restoring Stock Partitions (For Rooted Users Only)**  
  :::tip
  If your bootloader is locked, skip directly to Point B!
  :::

1. Check your current Nothing OS version:  
   - Go to `Settings > About phone > Tap the device banner`.  
   - Note down the build number.  

2. Fetch stock images for your current firmware build:  
   - Download the `-boot-image.7z` file.  
   - Extract the archive to obtain `.img` files.  

3. Identify the required partitions:  
   - Qualcomm devices: `boot`, `init_boot`, `vendor_boot`, `recovery`, `vbmeta`  
   - MediaTek devices: `init_boot`, `vbmeta`, `lk`

4. **Flash stock partitions** in bootloader mode:  
   :::note
   Only modified partitions are required to be flashed. Also skip any missing partitions based on your SoC platform. 
   :::
   ```sh
   fastboot flash boot boot.img
   fastboot flash recovery recovery.img
   fastboot flash vendor_boot vendor_boot.img
   fastboot flash vbmeta vbmeta.img
   fastboot flash init_boot init_boot.img
   fastboot flash --slot=all lk lk.img
   ```

5. **Reboot to system and update via System Updater:**
   - If the update **fails**, proceed with **manual sideloading** in the next section.

6. **Restoring Root (Optional):**
   - After updating, you may re-root by **flashing a patched boot image** for the updated NOS version.
   - **Modules will remain intact** after re-rooting.

<br />

B. **Proceed with Sideloading** 

 - **Download the Correct Update Firmware File:**  
   - Find the correct OTA firmware file for your device from [firmware index](/docs/firmware).

 - **How to Select the Right File?**  
   - Navigate to the repository and select your device model.  
   - Look for the Incremental OTA column.  
   - **Verify your current OS Build Number**:  
    - Go to: `Settings > System > About Phone`.  
    - Tap the **device banner** and note the **Build Number**.

 - **Example:**  
   - Suppose your **Phone (2)** has the build number: `Pong_U2.6-241016-1700` 
    - Assuming the latest available OTA update is: `Pong_V3.0-241226-2001`
    - The corresponding update pathway would be: `Pong_U2.6-241016-1700` -> `Pong_V3.0-241226-2001`
   - Ensure you select the correct pathway based on your device and OS version.
    - Refer to [this](https://github.com/spike0en/nothing_archive/blob/main/assets/sideloading/3.1_ota_sideload.jpg) for better clarity.

 - **Create the `ota` Folder:** 
   - Create a folder named `ota` in your device's **internal storage**, full path being:  
     ```text
     /sdcard/ota/
     ```
   - Move the downloaded `<firmware>.zip` file to this folder.

 - **Access the Nothing Offline OTA Updater:**  
    - Open the **Phone app** and dial:  
      ```text
      *#*#682#*#*
      ```
   - This will launch the built-in offline updater tool.  
   - The UI may show `NothingOfflineOtaUpdate` or `NOTHING BETA OTA UPDATE`; both work.

 - **Apply the Update:**  
   - The updater will automatically detect the update file.  
   - If not detected, manually browse and import the OTA file.  
   - Tap `Directly Apply OTA` or `Update` (based on the app UI).  
   - Wait for the update to complete; your device will reboot automatically.

:::note

- If the updater shows an **unknown error**, try using the **"Browse"** option instead of manually copying the file to the **"ota"** folder.
- **Full OTA firmware** can be sideloaded if incremental OTA fails.
- **Full OTA cannot be used to downgrade**; it can only update to the same or a higher build.
- **Unlocked bootloader users** can flash full OTA via custom recoveries (e.g., OrangeFox for Phone (2)).
- **Not every release has a Full OTA file**; use incrementals instead in such cases.

:::

### Safe Mode

- [Rebooting to Safe Mode](https://www.hardreset.info/devices/nothing/nothing-phone-2/safe-mode/)

### Dialer Codes

Dialer codes (USSD) that you can dial to access hidden menus and diagnostics.

| Code | Function |
|------|----------|
| `*#06#` | Shows IMEI and Serial Number |
| `*#07#` | Displays SAR levels and regulatory info |
| `*#*#569#*#*` | Opens Nothing Feedback / Log tool |
| `*#*#0#*#*` | Hardware test menu (screen, sensors, touch) |
| `*#*#9#*#*` | Opens Nothing Diagnostics menu |
| `*#*#225#*#*` | Shows Calendar storage info |
| `*#*#426#*#*` | Google Play / Firebase diagnostic info |
| `*#*#4636#*#*` | Testing menu (phone, battery, usage stats, Wi-Fi) |
| `*#*#682#*#*` | Opens Offline OTA Updater (won't work if Nothing Beta Hub is installed) |

:::tip[Hidden Diagnostics Menu]
Inside the Nothing Diagnostics menu (`*#*#9#*#*`), you can access advanced hardware diagnostic settings, tests, and tools by tapping the phone icon in the middle of the screen 10 times and entering the password `nothing`.
:::

## Device Features & Accessories

Guides for specific hardware tweaks and pairings.

### Battery Information Check

:::info
- Tested on Nothing Phone (3a), Phone (3), and Phone (4a) series.
- May not work on other devices or future Nothing OS versions (4.0 / 4.1+).
- This only lets you view existing system data and works with the stock Nothing OS firmware.
- It does not modify anything and will not affect your warranty.
:::

This guide shows how to open the hidden **Battery Information** page in Nothing OS, which is usually limited to EU variants but can be accessed on other regional variants using this method.

#### Requirements
- [Shizuku (Fork)](https://github.com/thedjchi/Shizuku)
- [Root Activity Launcher](https://sourceforge.net/projects/androidsage/files/Root%20Activity%20Launcher/)

#### Steps
1. Install both apps.
2. Set up Shizuku using the following [guide](https://shizuku.rikka.app/guide/setup/)
3. Grant Shizuku permission to Root Activity Launcher.
4. Open Root Activity Launcher and search for **Settings**.
5. Expand the Settings entry and launch the **Battery Information** sub-activity listed as:
   ```
   com.android.settings/com.nothing.settings.NtSettings$BatteryInformationActivity
   ```
6. You should now see the **Battery Information** page showing **Maximum capacity**, **Cycle count**, **Production date**, and **First use date** of the factory-installed battery.

### Unlocking Bauhaus Theme

The Bauhaus-inspired theme is a special edition feature that can be unlocked across various Nothing phone models.

#### Phone (2a) Special Edition
- [Unlock Hidden Feature](https://nothing.community/d/11058-hidden-feature-of-phone-2a-special-edition) by RapidZapper

#### Other Nothing Models

Requirements:
- PC with ADB & Fastboot
- [SetEdit App](https://github.com/MuntashirAkon/SetEdit)

Steps:

1. Enable Developer Options: Go to `Settings > About phone > Tap "Build number" 7 times`.
2. Enable USB Debugging: Go to `Settings > System > Developer options > Enable USB Debugging`.
3. Install SetEdit via ADB:
   - Rename the downloaded APK to `SetEdit.apk`.
   - Run the following command:
      ```sh
     adb install --bypass-low-target-sdk-block SetEdit.apk
     ```
4. Unlock the Theme:
   - Open SetEdit and grant any requested permissions.
   - In the **System Table**, look for `theme_bauhaus_enable`.
   - Set the value to `1` (Set it back to `0` to disable).
5. Apply the Theme:
   - Go to Nothing Launcher Settings and apply the new theme.

:::warning

- **Do NOT modify any other values in SetEdit!!**
- Changing random system settings may cause instability or system issues.

:::

### Essential Key Remapping

Guides for remapping the Essential Key on Phone (3):

| Guide | Author |
|-------|--------|
| [Reddit Guide](https://www.reddit.com/r/NothingTech/comments/1jzljrf/guide_how_to_remap_the_essential_key_on_the_phone/) | acruzjumper, McKeviin, DKmarc & Pealoaf |
| [Quick Remap Guide](https://www.reddit.com/r/NothingTech/comments/1jv6gea/quick_guide_to_remap_the_essential_space_button/) | David_Ign |
| [XDA Guide](https://xdaforums.com/t/how-to-disable-or-remap-the-essentials-button.4755184/) | rwilco12 |
| [GitHub Guide](https://github.com/z3phydev/How-to-remap-or-disable-the-Essential-Key) | z3phydev |

### Gadgetbridge Related

- [Supported Models and features](https://gadgetbridge.org/gadgets/wearables/nothing/)
- [Nothing CMF server pairing](https://gadgetbridge.org/basics/pairing/nothing-cmf-server/)

## Advanced Guides

:::warning
Recommended for power users only. These procedures can brick your device or void warranty if done incorrectly.
:::

These guides are ordered chronologically. It is highly recommended to follow this exact sequence.

### Prerequisites & Tools

Essential tools for advanced guides below.

#### USB Drivers

Essential drivers for USB file transfers and device recognition.

- [Google USB Drivers for Windows](https://dl.google.com/android/repository/usb_driver_r13-windows.zip)
- Installation guides: [USB](https://droidwin.com/android-usb-drivers) | [Fastboot](https://droidwin.com/how-to-install-fastboot-drivers-in-windows-11/)

:::note
macOS and Linux users do not need to install any external USB drivers. ADB and Fastboot will work out of the box once Platform Tools are installed.
:::

#### Platform Tools (ADB & Fastboot)

Download Android SDK Platform-Tools:
- [Windows / Linux / macOS](https://developer.android.com/studio/releases/platform-tools)
- [Installation Guide](https://www.xda-developers.com/install-adb-windows-macos-linux/)

Windows (using winget):
```cmd
winget install --id=Google.PlatformTools -e
```

macOS/Linux (using Homebrew):
```bash
brew install --cask android-platform-tools
```

### Unlocking Bootloader

:::info

- Unlocking the bootloader voids the OEM warranty. However, you can reflash the stock ROM and relock the bootloader to restore it.
- Regardless of other factors, Qualcomm devices will lose Widevine L1/DRM certification, which will downgrade to L3 until the bootloader is relocked.  
- You will lose [device integrity](https://developer.android.com/google/play/integrity/overview), which may cause apps relying on this to stop working unless fixed later with root access.  
  [This guide](https://github.com/yashaswee-exe/AndroidGuides/wiki/Fix-integrity-and-root-detection) may be helpful for resolving this issue. 

:::

A. **Prerequisites**
- **Backup your data** (unlocking will erase everything).
- **Install ADB & Fastboot tools** - [Download Platform Tools](https://developer.android.com/studio/releases/platform-tools).
- **Install USB drivers** - [Google USB Drivers](https://developer.android.com/studio/run/win-usb).
- Enable Developer Options:
  - `Settings > About phone > Tap "Build number" 7 times.`
- Enable USB Debugging & OEM Unlocking:
  - `Settings > System > Developer options > Enable USB Debugging & OEM Unlocking.`
- Remove Screen Lock/PIN/Password and Logged-in Accounts (optional but recommended)
  - Removing accounts before relocking the bootloader helps prevent Google FRP (Factory Reset Protection) lock. If FRP is triggered, the device will ask for the previously linked Google account after a factory reset. If you forget the credentials or can't access the account, you may be locked out of your device. To avoid this, it's recommended to remove all Google accounts before relocking.

B. **Unlocking Process**
- **Connect your phone to a PC** via USB.
- **Open a command prompt** in the platform-tools folder:
  - Windows: `Shift + Right Click` > **Open Command Prompt/Powershell here**.
  - Mac/Linux: Open **Terminal** and navigate to platform-tools.
- Verify device connection:
  ```sh
  adb devices
  ```
  If prompted, allow USB debugging on the phone.

- Reboot to bootloader:
   ```sh
   adb reboot bootloader
   ```

- Verify fastboot connection:
   ```sh
   fastboot devices
   ```
   If no device is detected, reinstall USB drivers.

- Unlock the bootloader:
   ```sh
   fastboot flashing unlock
   ```

- Confirm on your phone:
  - Use **Volume Keys** to navigate and **Power Button** to confirm.
  - Your device will **erase all data** and reboot.

C. **Post-Unlock**
  - Set up your phone again.
  - Verify bootloader status:
    ```sh
    Settings > System > Developer options > OEM Unlocking should be enabled.
    ```

  - Bootloader is now unlocked and your device will show an Orange State warning at boot; this is normal.

### Rooting

:::info

- Rooting **voids the OEM warranty** and may break OTA updates unless stock images are restored before updating.
- Always ensure the **boot / init_boot image exactly matches your current firmware build**.
  Flashing an incorrect or mismatched image **will cause bootloops**.
- **Always use `init_boot` over `boot` image for rooting if the partition exists**.
- Rooting requires an **unlocked bootloader**.
- Users can also refer to the visual guides linked alongside: [orailnoor](https://www.youtube.com/watch?v=v0i4rftKNWs) | [Droidwin](https://www.youtube.com/watch?v=4T1ZHDUCBsw) | [EpicDroid](https://www.youtube.com/watch?v=vXIBfyX7s-k).

:::

<br />

A. **Prerequisites**
- **Unlocked bootloader** with **USB Debugging enabled**
- A **PC with ADB & Fastboot**  
  *or* another Android phone with **USB-OTG + ADB app (e.g. [Bugjaeger](https://play.google.com/store/apps/details?id=eu.sisik.hackendebug&hl=en_IN))**  
  *or* a **custom recovery (e.g. TWRP / OrangeFox / AOSP based recoveries)**
- Basic familiarity with **ADB / Fastboot**
- **Stock firmware** matching your current build (for extracting images)
- Recommended root solutions:
  - [Magisk](https://github.com/topjohnwu/Magisk/releases) | [Installation](https://topjohnwu.github.io/Magisk/install.html)
  - [KernelSU (KSU)](https://github.com/tiann/KernelSU) | [Installation](https://kernelsu.org/guide/installation.html)
  - [KernelSU Next (KSUN)](https://github.com/KernelSU-Next/KernelSU-Next) | [Installation](https://kernelsu-next.github.io/webpage/pages/installation.html)

<br />

B. **Check Current Software Version**
- On your phone, navigate to: Settings > About phone > Tap the Nothing OS banner.
- **Note down the Build Number**
- Example: `Pong_B4.0-251119-1654`
- Ignore any regional suffix like `IND`/`EEA`/`TUR` and so on.

<br />

C. **Fetch Stock Boot / Init_boot Image**
- Navigate to the [release index](/docs/firmware).
- Select your **device model**
- Open **OTA Images** for your exact build
- Download the corresponding archive: `*-image-boot.img.7z` from release assets.

- Extract the archive and locate:
  - `init_boot.img` **(preferred, if present)**
  - `boot.img` (only if `init_boot` does not exist)

- **Transfer the image to your device**
  ```sh
  adb push init_boot.img /sdcard/Download/
  # or
  adb push boot.img /sdcard/Download/
  ```

<br />

D. **Patch the Image**

**Magisk**
- Install the latest Magisk APK on your device.
- Open Magisk → Install → Select and Patch a File.
- Choose the transferred `init_boot` (preferred) / `boot` image. 
- Magisk will generate: `magisk_patched-XXXXX.img`

<br />

**KernelSU / KernelSU Next**  

:::note

- For Nothing Phone (2): KSU based root method is supported with stock `boot.img`. But KSUN or SUSFS support requires a custom compiled kernel with the patches added.
- Known pre-patched custom kernel options available include: 
  [arter97 kernel](https://xdaforums.com/t/r44-arter97-kernel-for-nothing-phone-2.4631313/) - KSU prepatched. Does not support NOS 4.0+ yet | 
  [Meteoric Kernel (EOL)](https://github.com/HELLBOY017/kernel_nothing_sm8475) - KSUN + SUSFS prepatched. Does not support NOS 4.0+. |
  [Wild Kernel fork](https://github.com/MiguVT/Meteoric_KernelSU_SUSFS) - KSU + SUSFS prepatched. | 
  [Wild Kernel](https://github.com/WildKernels/GKI_KernelSU_SUSFS) - KSUN + SUSFS prepatched. Supports 5.10-android12. 
- Nothing models with Android 13+ vendors out of box i.e, ones launched after Phone (2) will support KSUN patching method.

:::

- Patching method is similar to that of magisk. From the KSU/KSUN manager tap on not installed > patch the `init_boot.img` and transfer the patched image to PC.

- Reboot to bootloader:
  ```sh
  adb reboot bootloader
  ```

- Flash the patched image
  ```bash
  fastboot flash init_boot <drag and drop patched_init_boot.img>
  ```

- Reboot to system:
  ```sh
  fastboot reboot
  ``` 

- The device should be rooted with KSU/KSUN.

### Play Integrity

| Guide | Link |
|-------|------|
| Fix Play Integrity & Root Detection | [Wiki](https://github.com/yashaswee-exe/AndroidGuides/wiki/Fix-integrity-and-root-detection) |

### Backing Up Essential Partitions

:::info

- After unlocking the bootloader, make sure to back up essential partitions such as `persist`, `modemst1`, `modemst2`, `fsg`, etc., **before** flashing custom ROMs or kernels.
- These partitions contain important data, including IMEI, network settings, and fingerprint sensor calibration.
- If lost or corrupted, your device may experience **loss of cellular connectivity, fingerprint issues, or even become bricked**.
- Creating backups ensures you can **restore your device** if something goes wrong.

:::

A. **Requirements**
- **Unlocked bootloader**
- **Root access** (via Magisk/KSU/Apatch)
- **Termux app** (install via F-Droid or Play Store)
- Check Partition Paths:
  - Qcom devices: `/dev/block/bootdevice/by-name/`
  - MTK devices: `/dev/block/by-name/`

B. **Backup Instructions**
- For Qualcomm (QCom) Devices:
  - Open **Termux** and grant root access using:
    ```sh
    su
    ```

  - Copy and paste the following command in one go:
    ```sh
    mkdir -p /sdcard/partitions_backup
    ls -1 /dev/block/bootdevice/by-name | grep -v userdata | grep -v super | \
    while read f; do dd if=/dev/block/bootdevice/by-name/$f of=/sdcard/partitions_backup/${f}.img; done
    ```
    This will create image files of **all partitions except `super` & `userdata`** in the **Internal Storage** inside a folder named **"partitions_backup"**.

  - **[Optional]** If the above command fails, try this alternative:
    ```sh
    mkdir -p /sdcard/partitions_backup
    for partition in /dev/block/bootdevice/by-name/*; do \
    [[ "$(basename "$partition")" != "userdata" && "$(basename "$partition")" != "super" ]] && \
    cp -f "$partition" /sdcard/partitions_backup/; done
    ```

- For MediaTek (MTK) Devices:
  - Open **Termux** and grant root access using:
    ```sh
    su
    ```

  - Copy and paste all the following commands in one go:
    ```sh
    mkdir -p /sdcard/partitions_backup/
    cd /sdcard/partitions_backup
    dd if=/dev/block/by-name/nvram of=/sdcard/partitions_backup/nvram.img
    dd if=/dev/block/by-name/nvdata of=/sdcard/partitions_backup/nvdata.img
    dd if=/dev/block/by-name/persist of=/sdcard/partitions_backup/persist.img
    dd if=/dev/block/by-name/nvcfg of=/sdcard/partitions_backup/nvcfg.img
    dd if=/dev/block/by-name/protect1 of=/sdcard/partitions_backup/protect1.img
    dd if=/dev/block/by-name/protect2 of=/sdcard/partitions_backup/protect2.img
    ```

C. **Storing Backup**
  - Move the **"partitions_backup"** folder to your **PC or secure storage**.
  - **Do NOT share these backups!** They contain unique device data like IMEI.

D. **Restoring Partitions**
  - For MediaTek devices:
    ```sh
    fastboot flash nvram nvram.img
    fastboot flash nvdata nvdata.img
    fastboot flash nvcfg nvcfg.img
    fastboot flash persist persist.img
    ```
    Reboot to recovery mode, perform a factory reset, and then reboot to system.

  - For Qualcomm devices:
     ```sh
     fastboot flash persist persist.img
     fastboot flash modemst1 modemst1.img
     fastboot flash modemst2 modemst2.img
     ```
     Factory reset is not mandatory in this case.

### Flashing Custom ROM

:::warning
Ensure your bootloader is unlocked before proceeding. Refer to the [Unlocking Bootloader](#unlocking-bootloader) guide if you have not done so.
:::

:::danger[Disclaimer & Warning]
- This is a generic guide designed to work in most scenarios. Always cross-reference and follow any specific instructions provided by the ROM developer or maintainer.
- Flashing a custom ROM for the first time or performing a clean flash **will erase all user data**. Back up your data before proceeding (e.g., using Google One, copying folders manually via `adb pull` or FTP, or using root backup tools like Swift Backup if your device is already rooted).
- You must have an unlocked bootloader and properly configured USB, ADB, and Fastboot drivers on your PC.
- Flashing custom ROMs or using experimental builds carries the risk of bootlooping or bricking your device. Proceed at your own risk. The project authors and contributors are not responsible for any damage to your device.
:::

:::info
- A **clean flash** wipes all user data and is mandatory when flashing a custom ROM for the first time or switching to a different ROM.
- A **dirty flash** (updating without wiping data) is generally supported only for minor updates of the same ROM. It is typically not supported for major version upgrades (e.g., Nothing OS/Android version transitions).
- You can distinguish between the two ROM types by checking the contents of the package:
  - If the zip contains a `payload.bin` file, it is a **Recovery/Sideload** based ROM (or OTA zip).
  - If it contains multiple individual partition `.img` files, it is a **Fastboot** based ROM.
:::

<br />

#### Recovery / Sideload Based ROMs

:::note[Key Considerations]
- **Sideload Progress & PC Status:** When running `adb sideload`, the progress indicator on your PC will often pause at around **47%** and may report `Total xfer: 1.00x` or error messages such as `adb: failed to read command: Success`, `No error`, or `Undefined error: 0`. This is normal behavior and indicates a successful transfer. Always refer to your phone's screen to verify that the installation completed (look for `exit status 0`). Reaching 47% on the PC and seeing `/metadata/ota` errors on the device screen after formatting are expected.
- **Flashing via Custom Recoveries:** Directly flashing recovery-based custom ROM builds using custom recoveries like TWRP or OrangeFox is generally possible. However, check developer notes to ensure functionality is not broken. Note that doing so may disable automatic OTA updates, as OTAs typically rely on the stock recovery image shipped with the ROM.
- **Error 7 (kInstallDeviceOpenError):** If you are switching from the stock ROM or another custom ROM and encounter `Error Applying update: 7 (ErrorCode: kInstallDeviceOpenError)` (or if flashing fails via recovery), you must flash the `super_empty.img` partition image. You can obtain this file from the Telegram discussion group for your specific device model.
- **Troubleshooting Sideload Failures:** If sideloading continues to fail, flash a Fastboot-based version of any available ROM first to set up the device. After that, flash the recovery image corresponding to your desired AOSP/CLO ROM, and sideload the ROM zip through it. It should complete successfully.
:::

##### Clean Flash

A. **Prerequisites**
- An **unlocked bootloader** with **USB Debugging** enabled.
- A **PC with ADB and Fastboot** configured (refer to [Platform Tools](#platform-tools-adb--fastboot)).
- The required files downloaded (some partition images may vary depending on the device model):
  - `boot.img`
  - `vendor_boot.img`
  - `recovery.img`
  - `super_empty.img` *(only required when flashing from stock ROM; skip if migrating from another custom ROM)*
  - `rom.zip`
  - `GApps package` *(optional, only for ROM builds labeled "Vanilla")*

:::tip
Place all downloaded `.img` files directly inside your `platform-tools` folder to simplify terminal commands. Otherwise, you will need to drag and drop the full file path of each image into the terminal.
:::

B. **Reboot to Bootloader**
1. Reboot your phone into bootloader mode:
   ```sh
   adb reboot bootloader
   ```
2. Verify that the device is recognized:
   ```sh
   fastboot devices
   ```
   :::note
   Your device should be listed as `<serial> fastboot`. If no device appears, check your connection or update your USB drivers by referring to the [USB Drivers](#usb-drivers) guide.
   :::

C. **Flash Required Images**
Flash only the required partition images based on your device's codename:

| Device Codename | Required Image(s) | Flashing Command |
| :--- | :--- | :--- |
| **Pong** | `boot.img`<br />`vendor_boot.img`<br />`recovery.img`<br />`vbmeta.img` *(for LineageOS only)* | `fastboot flash boot boot.img`<br />`fastboot flash vendor_boot vendor_boot.img`<br />`fastboot flash recovery recovery.img`<br />`fastboot flash vbmeta vbmeta.img` |
| **Pacman, PacmanPro** | `boot.img`<br />`vendor_boot.img` | `fastboot flash boot boot.img`<br />`fastboot flash vendor_boot vendor_boot.img` |
| **Asteroids, Metroid, Frogger, FroggerPro** | `recovery.img` *(use 6.1 kernel-based recovery for Asteroids if coming from stock)* | `fastboot flash recovery recovery.img` |
| **Spacewar, Tetris, Galaga, Galaxian** | `vendor_boot.img` | `fastboot flash vendor_boot vendor_boot.img` |

D. **Reboot to Userspace Fastboot (Fastbootd)**
Boot into userspace fastboot mode (fastbootd):
```sh
fastboot reboot fastboot
```

E. **Wipe Super Partition (Stock → Custom Only)**
:::warning
- Skip this step if you are migrating from another custom ROM.
- **Do not run this command** if you are not currently in the custom ROM's fastbootd interface.
- If you execute this command, **do not reboot your device** until you have successfully flashed a full system ROM.
:::
Wipe the super partition using the empty super image:
```sh
fastboot wipe-super super_empty.img
```

F. **Reboot to Recovery**
Boot into your newly flashed recovery:
```sh
fastboot reboot recovery
```

G. **Format Data**
In the recovery user interface, navigate to:
Factory Reset, then select Format data / factory reset

Alternatively, you can wipe user data via Fastboot:
```sh
fastboot erase userdata
fastboot erase metadata
```

H. **Sideload the ROM**
1. In the recovery menu, select Apply Update, then select Apply from ADB.
2. Verify the ADB sideload connection on your PC:
   ```sh
   adb devices
   ```
   *Expected output:* `<serial>   sideload`
   :::note
   If your device is not detected or shows as `unauthorized`:
   - Reconnect the USB cable.
   - Install or update your USB drivers (see [USB Drivers](#usb-drivers)).
   :::
3. Start the sideload installation:
   ```sh
   adb sideload rom.zip
   ```
   :::note
   The progress bar in your terminal may pause at **47%** and display `Total xfer: 1.00x`. This is expected; the ROM has successfully flashed. Check your phone's screen to confirm.
   :::

I. **GApps & Additional Packages**
Once the sideload completes, the recovery will ask if you want to install additional packages:
- For Vanilla builds: select **YES**, reboot to recovery, and sideload your GApps package:
  ```sh
  adb sideload gapps.zip
  ```
- For GMS builds: select **NO** (Google Apps are already included).

J. **Final Wipe and Boot**
1. Navigate to Factory Reset and select Format data / factory reset one final time to clear encryption.
2. Select **Reboot system now**.

<br />

##### Dirty Flash

:::info
- Magisk/KernelSU root access and modules typically survive a dirty flash.
- Support for dirty flashing **varies depending on the ROM and maintainer**. Always check the release notes or changelog before attempting.
- If the maintainer does not explicitly state that dirty flashing is supported, **you must perform a clean flash**.
:::

:::note
- **Nothing Phone (2a) Plus (pacmanpro) Users:** If you have flashed Fenrir on your device, dirty flashing is **not supported**. Doing so may brick your device or cause a bootloop. A clean flash is required every time you update or switch ROMs.
- If you have not flashed Fenrir, both the OTA and sideload dirty flash methods will work normally.
:::

A. **Method 1: OTA Update**
1. Navigate to Settings, then System, and select System updates.
2. Download the latest available OTA update.
3. Tap **Reboot** once the download and verification processes are complete.
4. Your device will install the update and reboot automatically.

B. **Method 2: Recovery Sideload**
1. Reboot the device to recovery mode:
   ```sh
   adb reboot recovery
   ```
2. Navigate to Apply Update, then select Apply from ADB.
3. Verify the connection on your PC:
   ```sh
   adb devices
   ```
   *Expected output:* `<serial>   sideload`
   :::note
   If your device is not detected or shows as `unauthorized`:
   - Disconnect and reconnect the USB cable.
   - Install or update your USB drivers (see [USB Drivers](#usb-drivers)).
   :::
4. Sideload the ROM zip file:
   ```sh
   adb sideload rom.zip
   ```
5. When prompted to install additional packages, select **NO** *(unless you need to reflash GApps)*.
6. Select **Reboot system now**.

<br />

#### Fastboot-Based ROMs

:::note
- Fastboot-based ROMs often require a specific version of the base Nothing OS firmware before installation. Please consult the maintainer's release notes. You can obtain base firmware images from the `image-firmware.7z` archive from the OTA releases section in the [firmware](/docs/firmware) page.
:::

A. **Prerequisites**
- An **unlocked bootloader** with **USB Debugging** enabled.
- A **PC with ADB and Fastboot** configured (refer to [Platform Tools](#platform-tools-adb--fastboot)).
- The Fastboot ROM package downloaded (typically contains `image` or `fastboot` in the file name, though this is not mandatory).

B. **Reboot to Bootloader**
1. Reboot your phone into bootloader mode:
   ```sh
   adb reboot bootloader
   ```
2. Verify that the device is recognized:
   ```sh
   fastboot devices
   ```
   :::note
   Your device should be listed as `<serial> fastboot`. If no device is detected, refer to the [USB Drivers](#usb-drivers) guide.
   :::

C. **Flash the ROM**
Run the following command depending on the type of flash you want to perform:

- For a Clean Flash (wipes all user data):
  ```sh
  fastboot -w update <path/to/rom_zip>
  ```

- For a Dirty Flash (retains user data):
  ```sh
  fastboot update <path/to/rom_zip>
  ```

### Flashing Stock ROM (Unbrick / Downgrade)

:::note

- This is the only recommended method for manually clean flashing to a newer version of stock firmware or downgrading.
- For a better understanding, refer to the visual guides linked alongside: [Droidwin](https://www.youtube.com/watch?v=YCYEjdC3oHM) | [The Nothing Lab](https://www.youtube.com/watch?v=l0P9gosl64s) | [QZX Tech](https://www.youtube.com/watch?v=66H2MVElyAY)

:::

A. **Preparation of Flashing Folder:**
  - Download the following files for your device model and firmware build, and place them in a dedicated folder:
    - image-boot.7z
    - image-firmware.7z
    - image-logical.7z.001-00x
    - `-hash.sha256` - This is optional but recommended for verifying file integrity and detecting missing parts.

  - Install 7-Zip from https://www.7-zip.org/

  - Optional (**recommended**): You can use extraction scripts instead of manual steps:
    - [Windows](https://github.com/spike0en/nothing_archive/blob/main/scripts/extract.bat)
    - [Bash](https://github.com/spike0en/nothing_archive/blob/main/scripts/extract.sh)
    - Run the script from the same folder where the downloaded files are located.

  - Extract files:
    - Windows: Right-click → Extract to "*\"
    - Bash users: `7za -y x "*.7z*"`

  - In rare cases, download managers may modify the extensions of split logical files.
  - Rename:
    - `-image-logical.7z.001.7z` → `-image-logical.7z.001`
    - `-image-logical.7z.002.7z` → `-image-logical.7z.002`
  - Then retry the extraction.

B. **Proceeding with Flashing:**
  - Install compatible USB drivers from [compatible Android USB drivers](https://developer.android.com/studio/run/win-usb).
  - Ensure that `Android Bootloader Interface` is visible in **Device Manager** when the device is in **bootloader mode**.
  - If the extraction script was used earlier, execute it directly. Otherwise:
    - Download the model-specific [Nothing Flasher Script](https://github.com/spike0en/nothing_flasher) suited for your OS (Windows `.bat` / Bash `.sh` / Termux `.sh`).
    - Move all extracted partition image files (or images dumped from a full stock OTA via `payload_dumper_go`) into the same folder as the script.
    - Place the `-hash.sha256` file in the same directory.
    - Always download the latest script to ensure hotfixes are included.

  - **Understanding Script Partitioning & Slots:**
    - The script defaults to flashing to **Slot A** and erases Slot B to free up space.
    - *Exception (Phone (3a) Series):* Due to custom ROM compatibility with 6.6 kernels, the script flashes to the inactive slot and switches slots prior to rebooting.

  - **Run the Script:**
    - Connect your device in bootloader mode.
    - Ensure you have a working internet connection (needed to auto-download the latest `platform-tools`). If the automatic download fails, download it manually and place the folder hierarchy as specified in the script's repository.
    - **Windows:** Double-click `flash_all.bat`.
    - **Bash/Linux/macOS:** Open terminal, navigate to the folder, and run:
      ```bash
      chmod +x flash_all.sh
      bash flash_all.sh
      ```
    - Follow the prompts and configure options:
      - Answer the confirmation questionnaire.
      - Skip or proceed with hash checks accordingly. 
      - Choose whether to wipe data: (Y/N) [Clean Flash / Downgrade = `Y` | Dirty Flash / Upgrade = `N`]
      - Choose whether to flash to both slots: (Y/N)
      - Disable Android Verified Boot: (N) [Please note that if you choose `Y` here, the bootloader cannot be locked later on!]

  - **Verification:**
    - Verify that all partitions have been successfully flashed.
    - If successful, choose to reboot to system: (Y)
    - Do not reboot your device into the system if any errors occurred during flashing. Instead, reboot back to the bootloader and reflash after addressing the failure. Rebooting to the system without doing so might result in soft/hard bricks.

### Relocking Bootloader

A. **Prerequisites**
  - Remove **Screen Lock/PIN/Password and Logged-in Accounts** (optional but recommended).
  - Clean-flash the **stock ROM** following [Flashing Guide](#flashing-stock-rom-unbrick--downgrade). **Relocking the bootloader with modified partitions without flashing stock firmware may brick the device!**
  - Backup all data (relocking will **erase everything**).
  - Install **ADB & Fastboot tools** and USB drivers if not already set up.

B. **Relocking Process**
  - If you are in the system, reboot to bootloader:
    ```sh
    adb reboot bootloader
    ```

  - Verify fastboot connection:
    ```sh
    fastboot devices
    ```

  - Initiate bootloader relocking:
    ```sh
    fastboot flashing lock
    ```

  - Confirm on your phone:
    - Use **Volume Keys** to navigate and **Power Button** to confirm.
    - The device will be formatted and reboot with a locked bootloader.

C. **Post-Relock**
  - Set up your device again.
  - The bootloader is now locked!

## Hard Unbrick

:::note

This section should only be referred to when no other option is left to recover the device using the [Flashing Stock ROM guide](#flashing-stock-rom-unbrick--downgrade).

:::

### Drivers

Install the appropriate drivers for your device's SoC manufacturer.

- **Qualcomm HS-USB 9008 Driver:** [Gofile](https://gofile.io/d/s2C20f) // [Microsoft Update Catalog](https://catalog.update.microsoft.com/Search.aspx?q=qualcomm%20hs-usb) // [Pixeldrain](https://pixeldrain.com/u/xyUqeUyr)
- **MediaTek Driver:** [Gofile](https://gofile.io/d/s2C20f) // [MediaFire](https://www.mediafire.com/file/w0z94wwe4lkka7q/MTK-Driver-v5.2307.zip/file) // [Pixeldrain](https://pixeldrain.com/u/fLng7rMk)

### EDL Cable (Qualcomm)

- Note that Snapdragon-based devices might require a **Hydra v2 cable** if the stock cable does not allow the flashing tool to recognize the device even with drivers installed. 
- **Verification:** With the device switched off, hold both **Volume +** and **Volume -** buttons while connecting the cable to the PC. If using a Hydra v2 cable, press the button on the cable while connecting.
- For a **DIY method** to make an EDL cable, refer to [this guide](https://xdaforums.com/t/edl-cable-for-nothing-phone-2.4654742/) instead.

### Tools & Resources

:::danger[Disclaimer & Notice]

- This section serves solely as a reference index for resources already publicly available on the open web. This project does not host, store, or distribute any of the proprietary tools or binary files listed below.
- All links provided point to external, third-party repositories and file hosts over which we have no control. We do not guarantee the security, integrity, or legality of these external resources.
- These are leaked official service tools. The project authors and contributors assume no responsibility for any device damage, data loss, or unintended consequences resulting from their use.
- This project is independent and is not affiliated with, authorized by, or endorsed by Nothing Technology Limited.
- Tools in this section are intended for emergency recovery (hard brick) only and should not be used for routine flashing.
- If you are a copyright holder and wish to request the removal of a reference link, please [file a GitHub issue](https://github.com/spike0en/nothing_archive/issues).

:::

- [Official Unbrick Tools](https://telegram.me/Edward_ROMs/360)
- [Unofficial Qualcomm Firehose / Sahara / Streaming / Diag Tools](https://github.com/bkerler/edl) by bkerler
- [NTPI Dumper](https://github.com/AaronXenos/ntpi_dumper) by AaronXenos
- [Phone (2a) Series Hard Brick Helper](https://github.com/mistrmochov/nothing-pacman-hardbrick) by mistrmochov
- [Phone (2a) Series Flash Tool](https://github.com/R0rt1z2/pacman-flash-tool) by R0rt1z2
- [Firehose Auth Files for Nothing Phones](https://github.com/Vagelis1608/nothing_edl) by plusonsoy

## Aftermarket Development

Stay updated with custom ROMs, kernels, and development projects.

:::note

- This section is community-managed in [Telegram](https://t.me/s/NothingTechCommunity) and is not affiliated with Nothing.
- The links below provide filtered search results from Telegram channels without the need to sign up. However, it is recommended to do so to interact and join discussion chats for respective devices, seek support, or engage with the enthusiast community if you are interested in tinkering, maximizing your device's potential, or staying up to date with all releases.
- At times, the links below might return no results, which means that certain categories of content are not yet available, developed, or maintained by a reliable maintainer for that particular model.
- Unlocking the bootloader and flashing custom firmware will void your OEM warranty. Please read all flashing guides if stated in the corresponding posts and refer to the support chat if linked or the discussion group for the model.

:::

### Device Update Channels (Telegram)

Nothing Devices:

| Device | ROM | Recovery | Kernel | Updates |
|--------|-----|----------|--------|---------|
| Phone (1) | [ROM](https://telegram.me/s/NothingPhone1Updates?q=%23ROM) | [Recovery](https://telegram.me/s/NothingPhone1Updates?q=%23Recovery) | [Kernel](https://telegram.me/s/NothingPhone1Updates?q=%23Kernel) | [OTA](https://telegram.me/s/NothingPhone1Updates?q=%23OTA) |
| Phone (2) | [ROM](https://telegram.me/s/NothingPhone2updates?q=%23ROM) | [Recovery](https://telegram.me/s/NothingPhone2updates?q=%23Recovery) | [Kernel](https://telegram.me/s/NothingPhone2updates?q=%23Kernel) | [OTA](https://telegram.me/s/NothingPhone2updates?q=%23OTA) |
| Phone (2a) | [ROM](https://telegram.me/s/NothingPhone2aUpdates?q=%23ROM+%23Pacman) | [Recovery](https://telegram.me/s/NothingPhone2aUpdates?q=%23Recovery+%23Pacman) | [Kernel](https://telegram.me/s/NothingPhone2aUpdates?q=%23Kernel+%23Pacman) | [OTA](https://telegram.me/s/NothingPhone2aUpdates?q=%23OTA+%23Pacman) |
| Phone (2a) Plus | [ROM](https://telegram.me/s/NothingPhone2aUpdates?q=%23ROM+%23PacmanPro) | [Recovery](https://telegram.me/s/NothingPhone2aUpdates?q=%23Recovery+%23PacmanPro) | [Kernel](https://telegram.me/s/NothingPhone2aUpdates?q=%23Kernel+%23PacmanPro) | [OTA](https://telegram.me/s/NothingPhone2aUpdates?q=%23OTA+%23PacmanPro) |
| Phone (3a) Series | [ROM](https://telegram.me/s/NothingPhone3aUpdates?q=%23ROM) | [Recovery](https://telegram.me/s/NothingPhone3aUpdates?q=%23Recovery) | [Kernel](https://telegram.me/s/NothingPhone3aUpdates?q=%23Kernel) | [OTA](https://telegram.me/s/NothingPhone3aUpdates?q=%23OTA) |
| Phone (3a) Lite | [ROM](https://telegram.me/s/CMFPhone2GlobalUpdates?q=%23ROM+%23Galaxian) | [Recovery](https://telegram.me/s/CMFPhone2GlobalUpdates?q=%23Recovery+%23Galaxian) | [Kernel](https://telegram.me/s/CMFPhone2GlobalUpdates?q=%23Kernel+%23Galaxian) | [OTA](https://telegram.me/s/CMFPhone2GlobalUpdates?q=%23OTA+%23Galaxian) |
| Phone (3) | [ROM](https://telegram.me/s/Phone3Updates?q=%23ROM) | [Recovery](https://telegram.me/s/Phone3Updates?q=%23Recovery) | [Kernel](https://telegram.me/s/Phone3Updates?q=%23Kernel) | [OTA](https://telegram.me/s/Phone3Updates?q=%23OTA) |
| Phone (4a) | [ROM](https://telegram.me/s/Phone4aUpdates?q=%23ROM+%23Frogger) | [Recovery](https://telegram.me/s/Phone4aUpdates?q=%23Recovery+%23Frogger) | [Kernel](https://telegram.me/s/Phone4aUpdates?q=%23Kernel+%23Frogger) | [OTA](https://telegram.me/s/Phone4aUpdates?q=%23OTA+%23Frogger) |
| Phone (4a) Pro | [ROM](https://telegram.me/s/Phone4aUpdates?q=%23ROM+%23FroggerPro) | [Recovery](https://telegram.me/s/Phone4aUpdates?q=%23Recovery+%23FroggerPro) | [Kernel](https://telegram.me/s/Phone4aUpdates?q=%23Kernel+%23FroggerPro) | [OTA](https://telegram.me/s/Phone4aUpdates?q=%23OTA+%23FroggerPro) |

**CMF by Nothing:**

| Device | ROM | Recovery | Kernel | Updates |
|--------|-----|----------|--------|---------|
| Phone (1) | [ROM](https://telegram.me/s/CMFPhone1Updates?q=%23ROM) | [Recovery](https://telegram.me/s/CMFPhone1Updates?q=%23Recovery) | [Kernel](https://telegram.me/s/CMFPhone1Updates?q=%23Kernel) | [OTA](https://telegram.me/s/CMFPhone1Updates?q=%23OTA) |
| Phone (2) Pro | [ROM](https://telegram.me/s/CMFPhone2GlobalUpdates?q=%23OTA+%23Galaga) | [Recovery](https://telegram.me/s/CMFPhone2GlobalUpdates?q=%23OTA+%23Galaga) | [Kernel](https://telegram.me/s/CMFPhone2GlobalUpdates?q=%23OTA+%23Galaga) | [OTA](https://telegram.me/s/CMFPhone2GlobalUpdates?q=%23OTA+%23Galaga) |
