# SMHI Weather Warnings Card

## Overview
This card is a custom card specifically for the [SMHI Alert integration](https://github.com/Nicxe/home-assistant-smhialert) to display weather warnings from SMHI (Swedish Meteorological and Hydrological Institute) in Home Assistant.

*Based on [https://github.com/Lallassu/smhialert](https://github.com/Lallassu/smhialert)*

## Installation


You can install this custom component using [HACS](https://www.hacs.xyz/) as a custom repository by following this guide:

1. Click on the 3 dots in the top right corner of the HACS overview menu.
2. Select "Custom repositories".
3. Add the URL to the repository: ```https://github.com/Nicxe/home-assistant-smhialert-card```
4. Select type: Dashborad
5. Click the "ADD" button.




<details>

<summary>**Manual Installation** *(without HACS)*</summary>

1. Download the latest release of ```smhialert-card.js``` from GitHub Releases.
2. Place the smhialert-card.js file in your Home Assistant www folder (usually located in the config/www directory).
3. Add the following resource to your Home Assistant configuration by editing in raw mode: ```/local/smhi-alert-card.js```
4. Save your changes and refresh your Home Assistant interface to ensure the new resource is loaded.
</details>


## Configuration

To use the card, add the following to your dashboard:

### Card Example
```yaml
    type: custom:smhi-alert-card    
    entity: sensor.smhialert
    title: Vädervarningar
```

## Usage Screenshots

<img src="https://github.com/Nicxe/home-assistant-smhialert-card/blob/main/Screenshot.png">