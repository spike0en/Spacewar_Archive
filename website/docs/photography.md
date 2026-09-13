---
sidebar_position: 8
title: Photography
description: Google Camera ports, device sensor XML configs, and stock Nothing Camera presets.
---

# Photography Resources

GCAM ports, configs, and camera presets for Nothing devices.

## Google Camera Ports

| Port | Developer |
|------|-----------|
| [BSG & MGC](https://www.celsoazevedo.com/files/android/google-camera/dev-bsg/) | BSG |
| [AGC](https://www.celsoazevedo.com/files/android/google-camera/dev-BigKaka/) | Bigkaka |
| [LMC](https://www.celsoazevedo.com/files/android/google-camera/dev-hasli/) | hasli |
| [SGCam](https://www.celsoazevedo.com/files/android/google-camera/dev-shamim/) | Shamim |

### GCAM Configs

:::note
- Camera quality varies with each configuration. Test available profiles to find what fits your shooting conditions.
- For Snapdragon and MediaTek devices, use the **Snap** and **Aweme** package variants respectively.
- Tuning XML configs for specific sensor hardware delivers better image processing than running default port settings.
:::

#### Importing the Config

1. Download the config file (`.xml`) from the links below.
2. Open the downloaded GCAM app at least once. Make sure to give access to files, storage, camera, and other necessary permissions.
3. The folder for the respective cam variant will be created automatically in the root of internal storage. The path might vary but it generally follows the following:
- **AGC**: `Internal storage/Download/AGC/AGC X.Y/configs/`  
- **LMC**: `Internal storage/LMCX.Y/`  
- **SGCAM**: `Internal storage/SGCAM/X.Y.Z/XML/`

> `X.Y` or `X.Y.Z` represents the app version (e.g., `9.2` or `9.2.114`).

4. Move the downloaded `.xml` or `.agc` config file to the path mentioned in step 3.
5. Open the GCAM app again and load the config file as follows:
- For AGC: More settings Icon > Give access permissions to all files > come back > Go to **Settings**, select **Load Config**, then select the `.agc` file which you have saved under the AGC Configs folder then **Save**.
- LMC: Double-tap the empty area between the **shutter button** and the **camera switch icon**, select the config, and tap **Import**. Grant permissions if prompted.
6. The config will be applied automatically. Switch between profiles (if available) from the top bar.

#### Download Configs

The config files (`xml` or `.agc`) have been archived below by device name along with creator attribution:

#### Nothing

<div className="card-list">

- [Phone (1)](https://archive.org/download/nothing-archive/spike0en/photography/phone-1/)
- [Phone (2)](https://archive.org/download/nothing-archive/spike0en/photography/phone-2/)
- [Phone (2a) Series](https://archive.org/download/nothing-archive/spike0en/photography/phone-2a-series/)
- [Phone (3a) & (3a) Pro](https://archive.org/download/nothing-archive/spike0en/photography/phone-3a-series/)

</div>

#### CMF by Nothing

<div className="card-list">

- [Phone (1)](https://archive.org/download/nothing-archive/spike0en/photography/cmf-1/)
- [Phone (2) Pro](https://archive.org/download/nothing-archive/spike0en/photography/cmf-2pro/)

</div>

## Stock Camera Presets

Resources for Nothing Camera presets:

| Source | Link |
|--------|------|
| Discord Thread | [View](https://discord.com/channels/930878214237200394/1351115520245760021) |
| Google Photos Collection | [View](https://photos.google.com/share/AF1QipMLXmA5txDQHqlHzF6OV4HhkLTMsqUx9m8_3jMNH0_MizjA7038n_j8gz4v54zTNw?pli=1&key=QUJKYVY4akFFWGVCWWtleG9DMkNCcDc1c2V5TzZB) |
| Nothing Playground | [Browse](https://playground.nothing.tech/presets) |
| Notion Doc by flo_rahil | [View](http://aromatic-perfume-9a5.notion.site/1bd0ff2f0ced80c0b32cce32f552aa4e?v=1bd0ff2f0ced8152aa23000ce56a341a) |
| Reddit Search | [r/NothingTech](https://www.reddit.com/r/NothingTech/search/?q=camera+presets&type=posts&sort=new) <br /> [r/NOTHING](https://www.reddit.com/r/NOTHING/search/?q=camera+presets&type=posts&sort=new) <br /> [r/CMFtech](https://www.reddit.com/r/CMFTech/search/?q=camera+presets&type=posts&sort=new) |
| Telegram Community | [Join](https://telegram.me/NothingTelegramCommunity) |


