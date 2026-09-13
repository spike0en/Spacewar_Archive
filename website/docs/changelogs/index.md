---
title: OTA Changelogs
sidebar_label: OTA Changelogs
pagination_label: OTA Changelogs
sidebar_position: 1
slug: /changelogs
pagination_prev: firmware
pagination_next: guides
description: Official Nothing OS update changelogs, build number anatomy, update cadence timelines, and model update directories.
---

# Nothing OS Updates & Changelogs

Welcome to the Nothing OS update index, featuring official changelogs for Nothing and CMF devices. 

Review these guidelines to understand how Nothing OS updates are built and distributed.

## 🚀 How Updates Work

### 1. Phased Regional Rollouts
Nothing OS updates roll out in staged phases over several days so the software team can monitor stability before global deployment. 
* **Manual Sideloading**: Official incremental and full update packages are available in the [Firmware](../firmware.md) section. Devices can also be updated manually by following the [Sideloading Guides](../guides.md).

### 2. Update Frequency & Cadence
Nothing OS devices generally target a **bi-monthly** (every two months) update cycle. 
* **Cadence Expectations**: All Nothing phones receive at least one update within a two-month period. This is an approximate calendar-based schedule rather than a strict 60-day interval. For example, if an update is released on March 5, the next update is typically expected before the end of May rather than exactly 60 days later.
* **Model-Specific Timings**: Different device models do not receive updates on the same date. While simultaneous rollouts can occur, they are not guaranteed, as each model has its own independent development and testing cycles.
* **Hotfixes**: The software team may release additional mid-cycle hotfix updates if critical issues require urgent resolution.
* **Launch Phase**: Newly launched devices typically receive more frequent updates during their first few months to address initial post-release feedback, bug fixes, battery/performance optimization, camera tuning and more.

### 3. Understanding Build Numbers
Nothing OS software build numbers contain structured metadata about the build itself. 

The table below breaks down two sample builds: `FroggerPro-C5.0-260902-1559` and `Asteroids-B4.1-260414-1749`.

| Component | `FroggerPro-C5.0-260902-1559` | `Asteroids-B4.1-260414-1749` | Description |
| :--- | :--- | :--- | :--- |
| **Device Codename** | `FroggerPro` | `Asteroids` | Codename representing the specific device (Phone (4a) Pro vs Phone (3a)) |
| **Android Version** | `C` | `B` | Android version codename character (e.g. `C` = Cinnamon Bun/Android 17, `B` = Baklava/Android 16, `V` = Vanilla Ice Cream/Android 15, `U` = Upside Down Cake/Android 14) |
| **Nothing OS Version** | `5.0` | `4.1` | Nothing OS version number |
| **Build Date** | `260902` (September 02, 2026) | `260414` (April 14, 2026) | The compilation date in `YYMMDD` format |
| **Build Time** | `1559` | `1749` | The compilation time in `HHMM` 24-hour format |

:::info[Build Date vs. Public Rollout]
Every software build undergoes internal quality assurance and testing by the Nothing software team before release. A delay between the compilation date and the public rollout date is normal. 

For example, `Asteroids-B4.1-260414-1749` was compiled on April 14, but rolled out on April 24. The bi-monthly schedule countdown for the next update begins on the public rollout date rather than the compilation date. The next OTA update ([`Asteroids-B4.1-260810-1153`](./asteroids/Asteroids-B4.1-260810-1153.md)) arrived on August 19, 2026.
:::

### 4. Security Patch Integration
A new software build does not always include the latest monthly Android security patch. Security patch integration depends on Google's release schedule, Nothing's development cycle, and build cut-off dates.

### 5. Feature Parity & Model Differences
Each Nothing and CMF device has its own development cycle tailored to its hardware. Do not compare version numbers or release timing directly between different device generations.
* **Trickle-Down Features**: Features introduced on newer models gradually make their way back to older devices over time, unless there are hardware limitations. However, newer models may be prioritized first to support initial sales launches.
* **Version Parity**: Having the same version number (e.g., Nothing OS 4.1) on two different devices does not mean they have identical features. For example, budget-friendly models and flagship models will have features tailored to their hardware capabilities (e.g., custom camera modes or depth effects on lockscreen might be rolled out to models at different times).

:::tip[Technical Background]
To learn more about the development, testing, and distribution process behind Nothing OS updates, see the community article:
👉 **[Inside a Major Nothing OS Update](https://nothing.community/d/47051-inside-a-major-nothing-os-update)**
:::

## Select Your Device 📱

Select your device model below to view its complete Nothing OS update history and official changelogs.

import DeviceGrid from '@site/src/components/DeviceGrid';

<DeviceGrid />
