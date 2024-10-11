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

    if (this.lastChild && this._messages === messages) {
      return;
    }

    this._messages = messages;

    const card = document.createElement('ha-card');
    const style = document.createElement('style');

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
        border: 1px solid var(--primary-color);
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

    const temperatureSvgBase64 = 'data:image/svg+xml;base64,PHN2ZyBpZD0iSWNvbnMiIHhtbG5zPSJodHRwOi8vd3d3LnczLm9yZy8yMDAwL3N2ZyIgdmlld0JveD0iMCAwIDMyIDMyIj48cGF0aCBkPSJNMTYsOUE1LDUsMCwwLDAsNiw5djcuMTFhNyw3LDAsMCwwLDAsOS43OFYyNmguMTFhNyw3LDAsMCwwLDkuNzgsMEgxNnYtLjExYTcsNywwLDAsMCwwLTkuNzhaTTE0LjU3LDI0LjVsMCwwLDAsMGE1LDUsMCwwLDEtNywwbDAsMCwwLDBhNSw1LDAsMCwxLDAtN0w4LDE2LjkyVjlhMywzLDAsMCwxLDYsMHY3LjkybC41Ny41OGE1LDUsMCwwLDEsMCw3WiIvPjxwYXRoIGQ9Ik0xMiwxOC4xOFY5YTEsMSwwLDAsMC0xLTFoMGExLDEsMCwwLDAtMSwxdjkuMThhMywzLDAsMSwwLDIsMFoiLz48cGF0aCBkPSJNMTgsOWwxMCw1VjRabTgsMS43NkwyMi40Nyw5LDI2LDcuMjRaIi8+PC9zdmc+';

    const yellowWarningSvgBase64 = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMzJweCIgaGVpZ2h0PSIzMnB4IiB2aWV3Qm94PSIwIDAgMzIgMzIiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDY0ICg5MzUzNykgLSBodHRwczovL3NrZXRjaC5jb20gLS0+CiAgICA8dGl0bGU+TGlnaHQgTW9kZSAvIFdhcm5pbmcgSWNvbiAvIDMyeDMyIC8gd2VhdGhlci13YXJuaW5nLXllbGxvdy0zMngzMjwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxnIGlkPSJMaWdodC1Nb2RlLS8tV2FybmluZy1JY29uLS8tMzJ4MzItLy13ZWF0aGVyLXdhcm5pbmcteWVsbG93LTMyeDMyIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8cGF0aCBkPSJNMTYsMy45OTk5OTk5NiBDMjIuNjI3NDE3LDMuOTk5OTk5OTYgMjgsOS4zNzI1ODI5OCAyOCwxNiBDMjgsMjIuNjI3NDE3IDIyLjYyNzQxNywyOCAxNiwyOCBDOS4zNzI1ODI5OCwyOCAzLjk5OTk5OTk2LDIyLjYyNzQxNyAzLjk5OTk5OTk2LDE2IEMzLjk5OTk5OTk2LDkuMzcyNTgyOTggOS4zNzI1ODI5OCwzLjk5OTk5OTk2IDE2LDMuOTk5OTk5OTYiIGlkPSJCYWNrZ3JvdW5kIiBmaWxsPSIjRkNGRjQwIiBmaWxsLXJ1bGU9Im5vbnplcm8iPjwvcGF0aD4KICAgICAgICA8cGF0aCBkPSJNMTYsMS45OTk5OTk5NiBDMTkuNzEzMDMwOSwxLjk5OTk5OTk2IDIzLjI3Mzk4NTcsMy40NzQ5OTU3MyAyNS44OTk0OTUsNi4xMDA1MDUwMyBDMjguNTI1MDA0Myw4LjcyNjAxNDM0IDMwLDEyLjI4Njk2OTEgMzAsMTYgQzMwLDIzLjczMTk4NjUgMjMuNzMxOTg2NSwzMCAxNiwzMCBDOC4yNjgwMTM0OCwzMCAxLjk5OTk5OTk2LDIzLjczMTk4NjUgMS45OTk5OTk5NiwxNiBDMS45OTk5OTk5Niw4LjI2ODAxMzQ4IDguMjY4MDEzNDgsMS45OTk5OTk5NiAxNiwxLjk5OTk5OTk2IFogTTE2LDMuOTk5OTk5OTYgQzkuMzcyNTgyOTgsMy45OTk5OTk5NiAzLjk5OTk5OTk2LDkuMzcyNTgyOTggMy45OTk5OTk5NiwxNiBDMy45OTk5OTk5NiwyMi42Mjc0MTcgOS4zNzI1ODI5OCwyOCAxNiwyOCBDMjIuNjI3NDE3LDI4IDI4LDIyLjYyNzQxNyAyOCwxNiBDMjgsOS4zNzI1ODI5OCAyMi42Mjc0MTcsMy45OTk5OTk5NiAxNiwzLjk5OTk5OTk2IFogTTE2LDE4IEMxNi41NTIyODQ4LDE4IDE3LDE4LjQ0NzcxNTMgMTcsMTkgQzE3LDE5LjU1MjI4NDggMTYuNTUyMjg0OCwyMCAxNiwyMCBDMTUuNDQ3NzE1MiwyMCAxNSwxOS41NTIyODQ4IDE1LDE5IEMxNSwxOC40NDc3MTUzIDE1LjQ0NzcxNTIsMTggMTYsMTggWiBNMTcsMTIgTDE3LDE3IEwxNSwxNyBMMTUsMTIgTDE3LDEyIFoiIGlkPSJPdXRsaW5lIiBmaWxsPSIjMTIyMTJCIiBmaWxsLXJ1bGU9Im5vbnplcm8iPjwvcGF0aD4KICAgIDwvZz4KPC9zdmc+';

    const orangeWarningSvgBase64 = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMzJweCIgaGVpZ2h0PSIzMnB4IiB2aWV3Qm94PSIwIDAgMzIgMzIiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDY0ICg5MzUzNykgLSBodHRwczovL3NrZXRjaC5jb20gLS0+CiAgICA8dGl0bGU+TGlnaHQgTW9kZSAvIFdhcm5pbmcgSWNvbiAvIDMyeDMyIC8gd2VhdGhlci13YXJuaW5nLW9yYW5nZS0zMngzMjwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxnIGlkPSJMaWdodC1Nb2RlLS8tV2FybmluZy1JY29uLS8tMzJ4MzItLy13ZWF0aGVyLXdhcm5pbmctb3JhbmdlLTMyeDMyIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8cG9seWxpbmUgaWQ9IkJhY2tncm91bmQiIGZpbGw9IiNGQkIwNjAiIGZpbGwtcnVsZT0ibm9uemVybyIgcG9pbnRzPSIxNiAzLjk5OTk5OTk2IDI4IDE2IDE2IDI4IDMuOTk5OTk5OTYgMTYgMTYgMy45OTk5OTk5NiI+PC9wb2x5bGluZT4KICAgICAgICA8cGF0aCBkPSJNMTYsMS45OTk5OTk5NiBDMTYuNTI5NTc2OSwyLjAwMjIzMjc1IDE3LjAzNjY0OTcsMi4yMTQ0MTIxNyAxNy40MSwyLjU4OTk5OTk2IEwxNy40MSwyLjU4OTk5OTk2IEwyOS40MSwxNC41OSBDMzAuMTg1NDQ3MiwxNS4zNzAwNzQ5IDMwLjE4NTQ0NzIsMTYuNjI5OTI1MSAyOS40MSwxNy40MSBMMjkuNDEsMTcuNDEgTDE3LjQxLDI5LjQxIEMxNi42Mjk5MjUxLDMwLjE4NTQ0NzIgMTUuMzcwMDc0OSwzMC4xODU0NDcyIDE0LjU5LDI5LjQxIEwxNC41OSwyOS40MSBMMi41ODk5OTk5NiwxNy40MSBDMS44MTQ1NTI3NywxNi42Mjk5MjUxIDEuODE0NTUyNzcsMTUuMzcwMDc0OSAyLjU4OTk5OTk2LDE0LjU5IEwyLjU4OTk5OTk2LDE0LjU5IEwxNC41OSwyLjU4OTk5OTk2IEMxNC45NjMzNTAzLDIuMjE0NDEyMTcgMTUuNDcwNDIzMSwyLjAwMjIzMjc1IDE2LDEuOTk5OTk5OTYgWiBNMTYsMy45OTk5OTk5NiBMMy45OTk5OTk5NiwxNiBMMTYsMjggTDI4LDE2IEwxNiwzLjk5OTk5OTk2IFogTTE2LDE4IEMxNi41NTIyODQ4LDE4IDE3LDE4LjQ0NzcxNTMgMTcsMTkgQzE3LDE5LjU1MjI4NDggMTYuNTUyMjg0OCwyMCAxNiwyMCBDMTUuNDQ3NzE1MiwyMCAxNSwxOS41NTIyODQ4IDE1LDE5IEMxNSwxOC40NDc3MTUzIDE1LjQ0NzcxNTIsMTggMTYsMTggWiBNMTcsMTIgTDE3LDE3IEwxNSwxNyBMMTUsMTIgTDE3LDEyIFoiIGlkPSJPdXRsaW5lIiBmaWxsPSIjMTIyMTJCIiBmaWxsLXJ1bGU9Im5vbnplcm8iPjwvcGF0aD4KICAgIDwvZz4KPC9zdmc+';

    const redWarningSvgBase64 = 'data:image/svg+xml;base64,PD94bWwgdmVyc2lvbj0iMS4wIiBlbmNvZGluZz0iVVRGLTgiPz4KPHN2ZyB3aWR0aD0iMzJweCIgaGVpZ2h0PSIzMnB4IiB2aWV3Qm94PSIwIDAgMzIgMzIiIHZlcnNpb249IjEuMSIgeG1sbnM9Imh0dHA6Ly93d3cudzMub3JnLzIwMDAvc3ZnIiB4bWxuczp4bGluaz0iaHR0cDovL3d3dy53My5vcmcvMTk5OS94bGluayI+CiAgICA8IS0tIEdlbmVyYXRvcjogU2tldGNoIDY0ICg5MzUzNykgLSBodHRwczovL3NrZXRjaC5jb20gLS0+CiAgICA8dGl0bGU+TGlnaHQgTW9kZSAvIFdhcm5pbmcgSWNvbiAvIDMyeDMyIC8gd2VhdGhlci13YXJuaW5nLXJlZC0zMngzMjwvdGl0bGU+CiAgICA8ZGVzYz5DcmVhdGVkIHdpdGggU2tldGNoLjwvZGVzYz4KICAgIDxnIGlkPSJMaWdodC1Nb2RlLS8tV2FybmluZy1JY29uLS8tMzJ4MzItLy13ZWF0aGVyLXdhcm5pbmctcmVkLTMyeDMyIiBzdHJva2U9Im5vbmUiIHN0cm9rZS13aWR0aD0iMSIgZmlsbD0ibm9uZSIgZmlsbC1ydWxlPSJldmVub2RkIj4KICAgICAgICA8cG9seWdvbiBpZD0iQmFja2dyb3VuZCIgZmlsbD0iI0ZDNUY3OSIgZmlsbC1ydWxlPSJub256ZXJvIiBwb2ludHM9IjMuOTk5OTk5OTYgMjUgMTYgNC4yMTk5OTk5NiAyOCAyNSI+PC9wb2x5Z29uPgogICAgICAgIDxwYXRoIGQ9Ik0xNiwyLjIyMzU0MzY4IEMxNi43MTMwNjg2LDIuMjIzNTQzNjggMTcuMzcyMjAyMiwyLjYwMzE5NTYxIDE3LjczLDMuMjE5OTk5OTYgTDE3LjczLDMuMjE5OTk5OTYgTDI5LjczLDI0IEMzMC4wODcwODMsMjQuNjE4NDg1IDMwLjA4NzI3ODYsMjUuMzgwNDQ0NCAyOS43MzA1MTMzLDI1Ljk5OTExMjcgQzI5LjM3Mzc0NzksMjYuNjE3NzgwOSAyOC43MTQxNjQ4LDI2Ljk5OTI2NzkgMjgsMjcgTDI4LDI3IEwzLjk5OTk5OTk2LDI3IEMzLjI4NTgzNTE2LDI2Ljk5OTI2NzkgMi42MjYyNTIwNywyNi42MTc3ODA5IDIuMjY5NDg2NzIsMjUuOTk5MTEyNyBDMS45MTI3MjEzNywyNS4zODA0NDQ0IDEuOTEyOTE2OTksMjQuNjE4NDg1IDIuMjY5OTk5OTYsMjQgTDIuMjY5OTk5OTYsMjQgTDE0LjI3LDMuMjE5OTk5OTYgQzE0LjYyNzc5NzgsMi42MDMxOTU2MSAxNS4yODY5MzE0LDIuMjIzNTQzNjggMTYsMi4yMjM1NDM2OCBaIE0xNiw0LjIxOTk5OTk2IEwzLjk5OTk5OTk2LDI1IEwyOCwyNSBMMTYsNC4yMTk5OTk5NiBaIE0xNiwxOSBDMTYuNTUyMjg0OCwxOSAxNywxOS40NDc3MTUzIDE3LDIwIEMxNywyMC41NTIyODQ4IDE2LjU1MjI4NDgsMjEgMTYsMjEgQzE1LjQ0NzcxNTIsMjEgMTUsMTkuNTUyMjg0OCAxNSwxOSBDMTUsMTguNDQ3NzE1MyAxNS40NDc3MTUyLDE4IDE2LDE4IFogTTE3LDEzIEwxNywxOCBMMTUsMTggTDE1LDEzIEwxNywxMyBaIiBpZD0iT3V0bGluZSIgZmlsbD0iIzEyMjEyQiIgZmlsbC1ydWxlPSJub256ZXJvIj48L3BhdGg+CiAgICA8L2c+Cjwvc3ZnPg==';

    // Skapa headern om show_header är true eller undefined
    if (this.config.show_header !== false) {
      const header = document.createElement('div');
      header.className = 'header';
      header.innerHTML = `<div class="name">${this.config.title || stateObj.attributes.friendly_name}</div>`;
      card.appendChild(style);
      card.appendChild(header);
    } else {
      // Lägg ändå till stilen
      card.appendChild(style);
    }

    if (messages.length === 0) {
      const noAlerts = document.createElement('div');
      noAlerts.className = 'noalerts';
      noAlerts.textContent = 'Inga aktuella varningar.';
      card.appendChild(noAlerts);
    } else {
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
          } else if (event === 'risk för vattenbrist' || event === 'risk for water shortage') {
            iconElement = `<img class="box-icon" src="${waterShortageSvgBase64}" />`;
          } else if (event === 'höga temperaturer' || event === 'high temperatures') {
            iconElement = `<img class="box-icon" src="${temperatureSvgBase64}" />`;
          } else {
            // Standardikon om 'event' inte känns igen
            iconElement = `<ha-icon class="box-icon" icon="mdi:message-alert-outline"></ha-icon>`;
          }
        } else {
          // För andra koder, använd befintliga ikoner
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
              // Standardikon om 'code' inte känns igen
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
          ${this.config.show_period ? `<b>Period:</b> ${new Date(item.start).toLocaleString()} - ${item.end !== 'Okänt' ? new Date(item.end).toLocaleString() : 'Okänt'}<br>` : ''}
          ${this.config.show_details ? `<b>Beskrivning:</b><br>${item.details.replace(/\n/g, '<br>')}` : ''}
        `;

        // Lägg till boxHeader och msg i box
        box.appendChild(boxHeader);
        box.appendChild(msg);

        card.appendChild(box);
      });
    }

    // Rensa tidigare innehåll
    while (this.lastChild) {
      this.removeChild(this.lastChild);
    }

    // Lägg till kortet
    this.appendChild(card);
  }

  setConfig(config) {
    if (!config.entity) {
      throw new Error('Du måste ange en entitet.');
    }
    this.config = config;
  }

  getCardSize() {
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
    };
  }

  // Registrera kortet så att det visas i "Lägg till kort"-dialogen
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
    // Vi tar bort Shadow DOM för att säkerställa att 'ha-form' är tillgänglig
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

    if (!this.lastChild) {
      // Rendera formuläret endast om det inte redan finns
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
      ];

      const data = {
        entity: this._config.entity || '',
        title: this._config.title || '',
        show_header: this._config.show_header !== undefined ? this._config.show_header : true,
        show_type: this._config.show_type !== undefined ? this._config.show_type : true,
        show_level: this._config.show_level !== undefined ? this._config.show_level : true,
        show_severity: this._config.show_severity !== undefined ? this._config.show_severity : true,
        show_published: this._config.show_published !== undefined ? this._config.show_published : true,
        show_period: this._config.show_period !== undefined ? this._config.show_period : true,
        show_details: this._config.show_details !== undefined ? this._config.show_details : true,
      };

      const form = document.createElement('ha-form');
      form.schema = schema;
      form.data = data;
      form.hass = this._hass;

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
      // Uppdatera datan om formuläret redan finns
      const form = this.querySelector('ha-form');
      form.data = {
        entity: this._config.entity || '',
        title: this._config.title || '',
        show_header: this._config.show_header !== undefined ? this._config.show_header : true,
        show_type: this._config.show_type !== undefined ? this._config.show_type : true,
        show_level: this._config.show_level !== undefined ? this._config.show_level : true,
        show_severity: this._config.show_severity !== undefined ? this._config.show_severity : true,
        show_published: this._config.show_published !== undefined ? this._config.show_published : true,
        show_period: this._config.show_period !== undefined ? this._config.show_period : true,
        show_details: this._config.show_details !== undefined ? this._config.show_details : true,
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
  description: 'Displays SMHI warnings for selected regions using the SMHI Weather Warnings & Alerts integration',
});
