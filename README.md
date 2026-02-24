# SMHI Weather Warnings Card (Deprecated)

This repository is deprecated.

The SMHI alert card is now bundled and maintained in the SMHI Alerts integration repository:
[https://github.com/Nicxe/home-assistant-smhialerts](https://github.com/Nicxe/home-assistant-smhialerts)

New installations should install only the integration from `Nicxe/home-assistant-smhialerts`.
The integration now manages card delivery, required icon assets, and the Lovelace resource URL automatically.

If you currently use this standalone card repository, migrate by updating the SMHI Alerts integration and then removing this card repository from HACS.
Your existing dashboards can continue using `custom:smhi-alert-card`.
After migration, perform a hard browser reload to clear cached frontend files.

Detailed migration steps are available here:
[https://github.com/Nicxe/home-assistant-smhialerts/blob/main/MIGRATION.md](https://github.com/Nicxe/home-assistant-smhialerts/blob/main/MIGRATION.md)

No new features will be added in this repository.
