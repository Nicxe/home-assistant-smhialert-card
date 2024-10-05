# SMHI Weather Warnings Card

## Overview
This card is a custom card specifically for the [SMHI Alert integration](https://github.com/Nicxe/home-assistant-smhialert) to display weather warnings from SMHI in Home Assistant. For more information, see [SMHI Alert Integration](https://github.com/Nicxe/home-assistant-smhialert).

*Based on [https://github.com/Lallassu/smhialert](https://github.com/Lallassu/smhialert)*

## Installation

You can install this custom component using HACS as a custom repository by following this link: [HACS Custom Repositories Guide.](https://www.hacs.xyz/docs/faq/custom_repositories/?h=custom%20repositories)

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