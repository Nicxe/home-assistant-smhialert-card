class SmhiAlertCard extends HTMLElement {
  constructor() {
    super();
    // Vi tar bort Shadow DOM för att undvika problem med tillgång till komponenter som 'ha-icon' och 'ha-form'.
    // this.attachShadow({ mode: 'open' });
  }

  set hass(hass) {
    const entityId = this.config.entity;
    const stateObj = hass.states[entityId];

    if (!stateObj) {
      return;
    }

    const messages = stateObj.attributes.messages || [];

    // Förhindra onödig omrendering
    if (this.lastChild && this._messages === messages) {
      return;
    }

    this._messages = messages;

    const card = document.createElement('ha-card');
    const style = document.createElement('style');

    // Justera ramen för box (inte ha-card) baserat på this.config.show_border
    style.textContent = `
      ha-card {
        padding: 5px;
      }
      .header {
        padding: 16px;
        font-size: 1.5em;
        font-weight: bold;
        background-color: var(--primary-color);
        border-radius: 5px;
        color: white;
        border-bottom: 1px solid var(--divider-color);
        margin-bottom: 5px;
      }
      .name {
        margin: 0;
      }
      .box {
        padding: 16px;
        margin-bottom: 5px;
        ${this.config.show_border === false
          ? 'border: none;'
          : 'border: 1px solid var(--primary-color);'}
        border-radius: 5px;
        background-color: var(--card-background-color);
      }
      .box-header {
        display: flex;
        align-items: center;
        margin-bottom: 10px;
      }
      .box-icon {
        width: 32px;
        height: 32px;
        margin-right: 10px;
      }
      .district {
        font-size: 1.2em;
        font-weight: bold;
        margin: 0;
      }
      .msg {
        font-size: 0.9em;
        line-height: 1.5;
      }
      .noalerts {
        font-size: 1em;
        color: var(--secondary-text-color);
      }
    `;

    // Base64-kodade bilder
    const fireSvgBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHRpdGxlPmZpcmUtb3V0bGluZS0zMngzMjwvdGl0bGU+PHBhdGggZD0iTTIzLDExbC0xLTEtMiwyTDE2LDQsMTEsOWwtMSwxTDksMTFBOS45NCw5Ljk0LDAsMSwwLDIzLDExWk0xMy45LDI1LjEzYTMsMywwLDAsMSwwLTQuMmwyLjEtMi4xLDIuMSwyLjFhMywzLDAsMSwxLTQuMiw0LjJabTcuNzItMS40NmE3LjQyLDcuNDIsMCwwLDEtLjg3Ljc0LDUsNSwwLDAsMC0xLjI0LTQuOUwxNiwxNmwtMy41MSwzLjUxYTUsNSwwLDAsMC0xLjI0LDQuOSw3LjQyLDcuNDIsMCwwLDEtLjg3LS43NCw4LDgsMCwwLDEsMC0xMS4yM2wxLTEsMS0xLDMtMywyLjc2LDUuNTEsMS4yNCwyLjQ5LDItMiwuNTgtLjU3QTgsOCwwLDAsMSwyMS42MiwyMy42N1oiLz48L3N2Zz4=';
    const waterShortageSvgBase64 = 'data:image/svg+xml;base64,PHN2ZyB4bWxucz0iaHR0cDovL3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHRpdGxlPndhdGVyLXNob3J0YWdlLW91dGxpbmUtMzJ4MzI8L3RpdGxlPjxwYXRoIGQ9Ik03LjUsMjAuNDFzLTMuMjUsMi41My0zLjI1LDQuMzRhMy4yNSwzLjI1LDAsMCwwLDYuNSwwQzEwLjc1LDIyLjk0LDcuNSwyMC40MSw3LjUsMjAuNDFaTTcuNSwyNmExLjI0LDEuMjQsMCwwLDEtMS4yNS0xLjJBNS4xMiw1LjEyLDAsMCwxLDcuNSwyMy4wOWE1LjQxLDUuNDEsMCwwLDEsMS4yNSwxLjY2QTEuMjUsMS4yNSwwLDAsMSw3LjUsMjZaIi8+PHBhdGggZD0iTTEyLjg0LDExaDMuOTVsLjMtLjQ0YTMuNDksMy40OSwwLDAsMSw1LjgyLDBsLjMuNDRIMjhWOUgyNC4yNEE1LjUsNS41LDAsMCwwLDIxLDcuMVY2aDNWNEgxNlY2aDNWNy4xQTUuNSw1LjUsMCwwLDAsMTUuNzYsOUgxMi44NEE4Ljg2LDguODYsMCwwLDAsNCwxNy44NFYxOWg3VjE3Ljg4QTEuODgsMS44OCwwLDAsMSwxMi44OCwxNmgyLjg4YTUuNDksNS40OSwwLDAsMCw4LjQ4LDBIMjhWMTRIMjMuMjFsLS4zLjQ0YTMuNDksMy40OSwwLDAsMS01LjgyLDBsLS4zLS40NEgxMi44OEEzLjg4LDMuODgsMCwwLDAsOS4xLDE3aC0zQTYuODUsNi44NSwwLDAsMSwxMi44NCwxMVoiLz48L3N2Zz4=';
    const temperatureSvgBase64 = 'data:image/svg+xml;base64,PHN2ZyBpZD0iSWNvbnMiIHhtbG5zPSJodHRwOi8vd3d3dy53My5vcmcvMjAwMC9zdmciIHZpZXdCb3g9IjAgMCAzMiAzMiI+PHBhdGggZD0iTTE2LDlBNSw1LDAsMCwwLDYsOXY3LjExYTcsNywwLDAsMCwwLDkuNzhWMjZoLjExYTcsNywwLDAsMCw5Ljc4LDBIMTZ2LS4xMWE3LDcsMCwwLDAsMC05Ljc4Wk0xNC41NywyNC41bDAsMCwwLDBhNSw1LDAsMCwxLTcsMGwwLDAsMCwwYTUsNSwwLDAsMSwwLTdMODwxNi45MloiLz48cGF0aCBkPSJNMTIsMTguMThWOWExLDEsMCwwLDAtMS0xaDBhMSwxLDAsMCwwLTEsMXY5LjE4YTMsMywwLDEsMCwyLDBaIi8+PHBhdGggZD0iTTE4LDlsMTAsNVY0Wm04LDEuNzZMMjIuNDcsOSwyNiw3LjI0WiIvPjwvc3ZnPg==';
    const yellowWarningSvgBase64 = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMzJweCIgaGVpZ2h0PSIzMnB4IiB2aWV3Qm94PSIwIDAgMzIgMzIiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDx0aXRsZT5MaWdodCBNb2RlIC8gV2FybmluZyBJY29uIC8gMzJ4MzIgLyB3ZWF0aGVyLXdhcm5pbmcteWVsbG93LTMyeDMyPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGcgaWQ9IkxpZ2h0LU1vZGUtLy1XYXJuaW5nLUljb24tLy0zMngzMi0vLXdlYXRoZXItd2FybmluZy15ZWxsb3ctMzJ4MzIiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxwYXRoIGQ9Ik0xNiwzLjk5OTk5OTk2IEMyMi42Mjc0MTcsMy45OTk5OTk5NiAyOCw5LjM3MjU4Mjk4IDI4LDE2IEMyOCwyMi42Mjc0MTcgMjIuNjI3NDE3LDI4IDE2LDI4IEM5LjM3MjU4Mjk4LDI4IDMuOTk5OTk5OTYsMjIuNjI3NDE3IDMuOTk5OTk5OTYsMTYgQzMuOTk5OTk5OTYsOS4zNzI1ODI5OCA5LjM3MjU4Mjk4LDMuOTk5OTk5OTYgMTYsMy45OTk5OTk5NiIgaWQ9IkJhY2tncm91bmQiIGZpbGw9IiNGQ0ZGNDAiIGZpbGwtcnVsZT0ibm9uemVybyI+PC9wYXRoPgogICAgICAgIDxwYXRoIGQ9Ik0xNiwxLjk5OTk5OTk2IEMxOS43MTMwMzA5LDEuOTk5OTk5OTYgMjMuMjczOTg1NywzLjQ3NDk5NTczIDI1Ljg5OTQ5NSw2LjEwMDUwNTAzIEMyOC41MjUwMDQzLDguNzI2MDE0MzQgMzAsMTIuMjg2OTY5MTMgMzAsMTYgQzMwLDIzLjczMTk4NjUgMjMuNzMxOTg2NSwzMCAxNiwzMCBDOC4yNjgwMTM0OCwzMCAxLjk5OTk5OTk2LDIzLjczMTk4NjUgMS45OTk5OTk5NiwxNiBDMS45OTk5OTk5Niw4LjI2ODAxMzQ4IDguMjY4MDEzNDgsMS45OTk5OTk5NiAxNiwxLjk5OTk5OTk2IFogTTE2LDMuOTk5OTk5OTYgQzkuMzcyNTgyOTgsMy45OTk5OTk5NiAzLjk5OTk5OTk2LDkuMzcyNTgyOTggMy45OTk5OTk5NiwxNiBDMy45OTk5OTk5NiwyMi42Mjc0MTcgOS4zNzI1ODI5OCwyOCAxNiwyOCBDMjIuNjI3NDE3LDI4IDI4LDIyLjYyNzQxNyAyOCwxNiBDMjgsOS4zNzI1ODI5OCAyMi42Mjc0MTcsMy45OTk5OTk5NiAxNiwzLjk5OTk5OTk2IFogTTE2LDE4IEMxNi41NTIyODQ4LDE4IDE3LDE4LjQ0NzcxNTMgMTcsMTkgQzE3LDE5LjU1MjI4NDggMTYuNTUyMjg0OCwyMCAxNiwyMCBDMTUuNDQ3NzE1MiwyMCAxNSwxOS41NTIyODQ4IDE1LDE5IEMxNSwxOC40NDc3MTUzIDE1LjQ0NzcxNTIsMTggMTYsMTggWiBNMTcsMTIgTDE3LDE3IEwxNSwxNyBMMTUsMTIgTDE3LDEyIFoiIGlkPSJPdXRsaW5lIiBmaWxsPSIjMTIyMTJCIiBmaWxsLXJ1bGU9Im5vbnplcm8iPjwvcGF0aD4KICAgIDwvZz4KPC9zdmc+';
    const orangeWarningSvgBase64 = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMzJweCIgaGVpZ2h0PSIzMnB4IiB2aWV3Qm94PSIwIDAgMzIgMzIiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDx0aXRsZT5MaWdodCBNb2RlIC8gV2FybmluZyBJY29uIC8gMzJ4MzIgLyB3ZWF0aGVyLXdhcm5pbmctb3JhbmdlLTMyeDMyPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGcgaWQ9IkxpZ2h0LU1vZGUtLy1XYXJuaW5nLUljb24tLy0zMngzMi0vLXdlYXRoZXItd2FybmluZy1vcmFuZ2UtMzJ4MzIiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxwb2x5bGluZSBpZD0iQmFja2dyb3VuZCIgZmlsbD0iI0ZCQjA2MCIgZmlsbC1ydWxlPSJub256ZXJvIiBwb2ludHM9IjE2IDMuOTk5OTk5OTYgMjggMTYgMTYgMjggMy45OTk5OTk5NiAxNiAxNiAzLjk5OTk5OTk2Ij48L3BvbHlsaW5lPgogICAgICAgIDxwYXRoIGQ9Ik0xNiwxLjk5OTk5OTk2IEMxNi41Mjk1NzY5LDIuMDAyMjMyNzUgMTcuMDM2NjQ5NywyLjIxNDQxMjE3IDE3LjQxLDIuNTg5OTk5OTYgTDE3LjQxLDIuNTg5OTk5OTYgTDI5LjQxLDE0LjU5IEMzMC4xODU0NDcyLDE1LjM3MDA3NDkgMzAuMTg1NDQ3MiwxNi42Mjk5MjUxIDI5LjQxLDE3LjQxIEwyOS40MSwxNy40MSBMMTcuNDEsMjkuNDEgQzE2LjYyOTkyNTEsMzAuMTg1NDQ3MiAxNS4zNzAwNzQ5LDMwLjE4NTQ0NzIgMTQuNTksMjkuNDEgTDE0LjU5LDI5LjQxIEwyLjU4OTk5OTk2LDE3LjQxIEMxLjgxNDU1Mjc3LDE2LjYyOTkyNTEgMS44MTQ1NTI3NywxNS4zNzAwNzQ5IDIuNTg5OTk5OTYsMTQuNTkgTDIuNTg5OTk5OTYsMTQuNTkgTDE0LjU5LDIuNTg5OTk5OTYgQzE0Ljk2MzM1MDMsMi4yMTQ0MTIxNyAxNS40NzA0MjMxLDIuMDAyMjMyNzUgMTYsMi4yMjM1NDM2OCBaIE0xNiwzLjk5OTk5OTk2IEwzLjk5OTk5OTk2LDE2IEwxNiwyOCBMMjgsMTYgTDE2LDMuOTk5OTk5OTYgWiBNMTYsMTggQzE2LjU1MjI4NDgsMTggMTcsMTguNDQ3NzE1MyAxNywxOSBDMTcsMTkuNTUyMjg0OCAxNi41NTIyODQ4LDIwIDE2LDIwIEMxNS40NDc3MTUyLDIwIDE1LDE5LjU1MjI4NDggMTUsMTkgQzE1LDE4LjQ0NzcxNTMgMTUuNDQ3NzE1MiwxOCAxNiwxOCBaIE0xNywxMiBMMTcsMTcgTDE1LDE3IEwxNSwxMiBMMTcsMTIgWiIgaWQ9Ik91dGxpbmUiIGZpbGw9IiMxMjIxMkIiIGZpbGwtcnVsZT0ibm9uemVybyI+PC9wYXRoPgogICAgPC9nPgo8L3N2Zz4=';
    const redWarningSvgBase64 = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMzJweCIgaGVpZ2h0PSIzMnB4IiB2aWV3Qm94PSIwIDAgMzIgMzIiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIj4KICAgIDx0aXRsZT5MaWdodCBNb2RlIC8gV2FybmluZyBJY29uIC8gMzJ4MzIgLyB3ZWF0aGVyLXdhcm5pbmctcmVkLTMyeDMyPC90aXRsZT4KICAgIDxkZXNjPkNyZWF0ZWQgd2l0aCBTa2V0Y2guPC9kZXNjPgogICAgPGcgaWQ9IkxpZ2h0LU1vZGUtLy1XYXJuaW5nLUljb24tLy0zMngzMi0vLXdlYXRoZXItd2FybmluZy1yZWQtMzJ4MzIiIHN0cm9rZT0ibm9uZSIgc3Ryb2tlLXdpZHRoPSIxIiBmaWxsPSJub25lIiBmaWxsLXJ1bGU9ImV2ZW5vZGQiPgogICAgICAgIDxwb2x5Z29uIGlkPSJCYWNrZ3JvdW5kIiBmaWxsPSIjRkM1Rjc5IiBmaWxsLXJ1bGU9Im5vbnplcm8iIHBvaW50cz0iMy45OTk5OTk5NiAyNSAxNiA0LjIxOTk5OTk2IDI4IDI1Ij48L3BvbHlnb24+CiAgICAgICAgPHBhdGggZD0iTTE2LDIuMjIzNTQzNjggQzE2LjcxMzA2ODYsMi4yMjM1NDM2OCAxNy4zNzIyMDIyLDIuNjAzMTk1NjEgMTcuNzMsMy4yMTk5OTk5NiBMMTcuNzMsMy4yMTk5OTk5NiBMMjkuNzMsMjQgQzMwLjA4NzA4MywyNC42MTg0ODUgMzAuMDg3Mjc4NiwyNS4zODA0NDQ0IDI5LjczMDUxMzMsMjUuOTk5MTEyNyBDMjkuMzczNzQ3OSwyNi42MTc3ODA5IDI4LjcxNDE2NDgsMjYuOTk5MjY3OSAyOCwyNyBMMjgsMjcgTDMuOTk5OTk5OTYsMjcgQzMuMjg1ODM1MTYsMjYuOTk5MjY3OSAyLjYyNjI1MjA3LDI2LjYxNzc4MDkgMi4yNjk0ODY3MiwyNS45OTkxMTI3IEMxLjkxMjcyMTM3LDI1LjM4MDQ0NDQgMS45MTI5MTY5OSwyNC42MTg0ODUgMi4yNjk5OTk5NiwyNCBMMi4yNjk5OTk5NiwyNCBMMTQuMjcsMy4yMTk5OTk5NiBDMTQuNjI3Nzk3OCwyLjYwMzE5NTYxIDE1LjI4NjkzMTQsMi4yMjM1NDM2OCAxNiwyLjIyMzU0MzY4IFogTTE2LDQuMjE5OTk5OTYgTDMuOTk5OTk5OTYsMjUgTDI4LDI1IEwxNiw0LjIxOTk5OTk2IFogTTE2LDE5IEMxNi41NTIyODQ4LDE5IDE3LDE5LjQ0NzcxNTMgMTcsMjAgQzE3LDIwLjU1MjI4NDggMTYuNTUyMjg0OCwyMSAxNiwyMSBDMTUuNDQ3NzE1MiwyMSAxNSwxOS41NTIyODQ4IDE1LDE5IEMxNSwxOC40NDc3MTUzIDE1LjQ0NzcxNTIsMTggMTYsMTggWiBNMTcsMTMgTDE3LDE4IEwxNSwxOCBMMTUsMTMgTDE3LDEzIFoiIGlkPSJPdXRsaW5lIiBmaWxsPSIjMTIyMTJCIiBmaWxsLXJ1bGU9Im5vbnplcm8iPjwvcGF0aD4KICAgIDwvZz4KPC9zdmc+';

    // Skapa headern om show_header är true eller undefined
    if (this.config.show_header !== false) {
      const header = document.createElement('div');
      header.className = 'header';
      header.innerHTML = `<div class="name">${this.config.title || stateObj.attributes.friendly_name}</div>`;
      card.appendChild(style);
      card.appendChild(header);
    } else {
      // Lägg ändå till stilen om man valt bort header
      card.appendChild(style);
    }

    // Om inga varningar finns
    if (messages.length === 0) {
      const noAlerts = document.createElement('div');
      noAlerts.className = 'noalerts';
      noAlerts.textContent = 'Inga aktuella varningar.';
      card.appendChild(noAlerts);
    } else {
      // Skapa en box per varningsmeddelande
      messages.forEach((item) => {
        const box = document.createElement('div');
        box.className = 'box';

        // Hantera ikoner baserat på 'code' och 'event'
        let iconElement = '';

        if (item.code === 'MESSAGE') {
          // Normalisera 'event'-strängen
          const event = item.event.trim().toLowerCase();

          if (event === 'brandrisk' || event === 'fire risk') {
            iconElement = `<img class="box-icon" src="${fireSvgBase64}" />`;
          } else if (
            event === 'risk för vattenbrist' ||
            event === 'risk for water shortage'
          ) {
            iconElement = `<img class="box-icon" src="${waterShortageSvgBase64}" />`;
          } else if (
            event === 'höga temperaturer' ||
            event === 'high temperatures'
          ) {
            iconElement = `<img class="box-icon" src="${temperatureSvgBase64}" />`;
          } else {
            // Standardikon om 'event' inte känns igen
            iconElement = `<ha-icon class="box-icon" icon="mdi:message-alert-outline"></ha-icon>`;
          }
        } else {
          // För andra koder, använd varningsikoner
          switch (item.code) {
            case 'YELLOW':
              iconElement = `<img class="box-icon" src="${yellowWarningSvgBase64}" />`;
              break;
            case 'ORANGE':
              iconElement = `<img class="box-icon" src="${orangeWarningSvgBase64}" />`;
              break;
            case 'RED':
              iconElement = `<img class="box-icon" src="${redWarningSvgBase64}" />`;
              break;
            default:
              iconElement = `<ha-icon class="box-icon" icon="mdi:alert-circle-outline"></ha-icon>`;
          }
        }

        const boxHeader = document.createElement('div');
        boxHeader.className = 'box-header';

        // Lägg till ikonen och distriktet i boxHeader
        boxHeader.innerHTML = `
          ${iconElement}
          <div class="district">${item.area}</div>
        `;

        const msg = document.createElement('div');
        msg.className = 'msg';

        msg.innerHTML = `
          ${this.config.show_type ? `<b>Typ:</b> ${item.event}<br>` : ''}
          ${this.config.show_level ? `<b>Nivå:</b> ${item.level}<br>` : ''}
          ${this.config.show_severity ? `<b>Allvarlighetsgrad:</b> ${item.severity}<br>` : ''}
          ${this.config.show_published ? `<b>Utfärdad:</b> ${new Date(item.published).toLocaleString()}<br>` : ''}
          ${
            this.config.show_period
              ? `<b>Period:</b> ${new Date(item.start).toLocaleString()} - ${
                  item.end !== 'Okänt' ? new Date(item.end).toLocaleString() : 'Okänt'
                }<br>`
              : ''
          }
          ${
            this.config.show_details
              ? `<b>Beskrivning:</b><br>${item.details.replace(/\n/g, '<br>')}`
              : ''
          }
        `;

        // Lägg till rubrik och text i boxen
        box.appendChild(boxHeader);
        box.appendChild(msg);

        card.appendChild(box);
      });
    }

    // Rensa bort gammalt innehåll i komponenten
    while (this.lastChild) {
      this.removeChild(this.lastChild);
    }

    // Lägg slutligen till kortet
    this.appendChild(card);
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Du måste ange en entitet.');
    }
    this.config = config;
  }

  getCardSize() {
    // Returnerar storleken baserat på antal varningar + 1
    return 1 + (this._messages ? this._messages.length : 0);
  }

  static getConfigElement() {
    return document.createElement('smhi-alert-card-editor');
  }

  static getStubConfig(hass, entities) {
    return {
      entity: entities.find((e) => e.startsWith('sensor.')) || '',
      show_header: true,
      show_type: true,
      show_level: true,
      show_severity: true,
      show_published: true,
      show_period: true,
      show_details: true,
      show_border: true, // Används nu för boxens ram
    };
  }

  // Registrera kortet för "Lägg till kort"-dialogen
  static get type() {
    return 'smhi-alert-card';
  }

  static get description() {
    return 'Displays SMHI warnings for selected regions using the SMHI Weather Warnings & Alerts integration';
  }
}

customElements.define('smhi-alert-card', SmhiAlertCard);

class SmhiAlertCardEditor extends HTMLElement {
  constructor() {
    super();
    // Vi tar bort Shadow DOM för att säkerställa tillgång till 'ha-form'
    // this.attachShadow({ mode: 'open' });
  }

  setConfig(config) {
    this._config = config;
    this._render();
  }

  set hass(hass) {
    this._hass = hass;
    this._render();
  }

  _render() {
    if (!this._hass || !this._config) {
      return;
    }

    // Om vi inte redan har ett formulär, skapa ett
    if (!this.lastChild) {
      const schema = [
        {
          name: 'entity',
          required: true,
          selector: {
            entity: {
              domain: 'sensor',
            },
          },
        },
        {
          name: 'title',
          selector: {
            text: {},
          },
        },
        {
          name: 'show_header',
          selector: {
            boolean: {},
          },
        },
        {
          name: 'show_type',
          selector: {
            boolean: {},
          },
        },
        {
          name: 'show_level',
          selector: {
            boolean: {},
          },
        },
        {
          name: 'show_severity',
          selector: {
            boolean: {},
          },
        },
        {
          name: 'show_published',
          selector: {
            boolean: {},
          },
        },
        {
          name: 'show_period',
          selector: {
            boolean: {},
          },
        },
        {
          name: 'show_details',
          selector: {
            boolean: {},
          },
        },
        {
          name: 'show_border', // Styr nu box-ramen
          selector: {
            boolean: {},
          },
        },
      ];

      const data = {
        entity: this._config.entity || '',
        title: this._config.title || '',
        show_header:
          this._config.show_header !== undefined ? this._config.show_header : true,
        show_type:
          this._config.show_type !== undefined ? this._config.show_type : true,
        show_level:
          this._config.show_level !== undefined ? this._config.show_level : true,
        show_severity:
          this._config.show_severity !== undefined ? this._config.show_severity : true,
        show_published:
          this._config.show_published !== undefined
            ? this._config.show_published
            : true,
        show_period:
          this._config.show_period !== undefined ? this._config.show_period : true,
        show_details:
          this._config.show_details !== undefined ? this._config.show_details : true,
        show_border:
          this._config.show_border !== undefined ? this._config.show_border : true,
      };

      const form = document.createElement('ha-form');
      form.schema = schema;
      form.data = data;
      form.hass = this._hass;

      // Lyssna på formulärets ändringar
      form.addEventListener('value-changed', (ev) => {
        if (!this._config || !this._hass) {
          return;
        }
        this._config = { ...this._config, ...ev.detail.value };
        this.dispatchEvent(
          new CustomEvent('config-changed', {
            detail: { config: this._config },
          })
        );
      });

      this.appendChild(form);
    } else {
      // Om formuläret redan finns, uppdatera dess data
      const form = this.querySelector('ha-form');
      form.data = {
        entity: this._config.entity || '',
        title: this._config.title || '',
        show_header:
          this._config.show_header !== undefined ? this._config.show_header : true,
        show_type:
          this._config.show_type !== undefined ? this._config.show_type : true,
        show_level:
          this._config.show_level !== undefined ? this._config.show_level : true,
        show_severity:
          this._config.show_severity !== undefined ? this._config.show_severity : true,
        show_published:
          this._config.show_published !== undefined
            ? this._config.show_published
            : true,
        show_period:
          this._config.show_period !== undefined ? this._config.show_period : true,
        show_details:
          this._config.show_details !== undefined ? this._config.show_details : true,
        show_border:
          this._config.show_border !== undefined ? this._config.show_border : true,
      };
    }
  }
}

customElements.define('smhi-alert-card-editor', SmhiAlertCardEditor);

// Registrera kortet så att det visas i "Lägg till kort"-dialogen
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'smhi-alert-card',
  name: 'SMHI Alert Card',
  description:
    'Displays SMHI warnings for selected regions using the SMHI Weather Warnings & Alerts integration',
});