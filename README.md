# SMHI Weather Warnings Card,

<a href="https://buymeacoffee.com/niklasv" target="_blank"><img src="https://www.buymeacoffee.com/assets/img/custom_images/orange_img.png" alt="Buy Me A Coffee" style="height: auto !important;width: auto !important;" ></a>

<img alt="Maintenance" src="https://img.shields.io/maintenance/yes/2025"> <img alt="GitHub last commit" src="https://img.shields.io/github/last-commit/Nicxe/home-assistant-smhialert-card"><br><br>

## Overview
This custom card is designed for the [SMHI Alert integration](https://github.com/Nicxe/home-assistant-smhialert), allowing you to display weather warnings from the Swedish Meteorological and Hydrological Institute (SMHI) on your Home Assistant dashboards.

*Based on [https://github.com/Lallassu/smhialert](https://github.com/Lallassu/smhialert)*
## Disclaimer
This project is not affiliated with or supported by Home Assistant. It is community maintained.


## Installation

You can install this card by following one of the guides below:

### With HACS (Recommended)

[![Open your Home Assistant instance and open a repository inside the Home Assistant Community Store.](https://my.home-assistant.io/badges/hacs_repository.svg)](https://my.home-assistant.io/redirect/hacs_repository/?owner=Nicxe&repository=home-assistant-smhialert-card&category=plugin)


1. Click on the three dots in the top right corner of the HACS overview menu.
2. Select **Custom repositories**.
3. Add the repository URL: `https://github.com/Nicxe/home-assistant-smhialert-card`.
4. Set the type to **Dashboard**.
5. Click the **Add** button.
6. Search for **SMHI Alert Card** in HACS and click the **Download** button. The card is installed under `hacsfiles/smhi-alert-card/`.

<details>
<summary>Without HACS</summary>



1. Download `smhi-alert-card.js` and the SVG icons from the [latest release](https://github.com/Nicxe/home-assistant-smhialert-card/releases).
2. Copy these files into your `config/www` directory, e.g. `config/www/smhi-alert-card/`.
3. Add a reference to `smhi-alert-card.js` in your dashboard. There are two ways to do this:
    - **Using the UI:** Go to _Settings_ → _Dashboards_ → _More Options_ → _Resources_ → _Add Resource_. Set the URL as `/local/smhi-alert-card/smhi-alert-card.js` and set the _Resource type_ to `JavaScript Module`.
      **Note:** If you do not see the Resources menu, you need to enable _Advanced Mode_ in your _User Profile_.
    - **Using YAML:** Add the following code to the `lovelace` section of your configuration:
        ```yaml
        resources:
          - url: /local/smhi-alert-card/smhi-alert-card.js
            type: module
        ```

</details>
    
## Configuration

The card can be configured using the dashboard UI editor:

1. In the dashboard UI, click on the three dots in the top right corner.
2. Click **Edit Dashboard**.
3. Click the **Plus** button to add a new card.
4. Find **Custom: SMHI Alert Card** in the list.

### Card Example in YAML

```yaml
type: custom:smhi-alert-card
entity: sensor.smhi_alert
show_header: true
show_type: true
show_level: true
show_severity: true
show_published: true
show_period: true
show_descr: true
show_details: true
title: Vädervarningar
```

## Usage Screenshots

![Screenshot](https://github.com/Nicxe/home-assistant-smhialert-card/blob/main/Screenshot_1.png)

## Versioning
Releases are tagged on GitHub using semantic version numbers. Use the release page to download specific versions.
