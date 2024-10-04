class SmhiAlertCard extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
  }

  set hass(hass) {
    const entityId = this.config.entity;
    const stateObj = hass.states[entityId];

    if (!stateObj) {
      return;
    }

    const messages = stateObj.attributes.messages || [];

    // Only update the content if necessary
    if (this.lastChild && this._messages === messages) {
      return;
    }

    this._messages = messages;

    const card = document.createElement('ha-card');
    const style = document.createElement('style');

    style.textContent = `
      .box {
        padding: 10px;
        margin-bottom: 10px;
        border: 1px solid var(--primary-color);
        border-radius: 5px;
        background-color: var(--card-background-color);
      }
      .district {
        font-size: 1.2em;
        font-weight: bold;
        margin-bottom: 5px;
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

    const header = document.createElement('div');
    header.className = 'header';
    header.innerHTML = `<div class="name">${this.config.title || stateObj.attributes.friendly_name}</div>`;

    card.appendChild(style);
    card.appendChild(header);

    if (messages.length === 0) {
      const noAlerts = document.createElement('div');
      noAlerts.className = 'noalerts';
      noAlerts.textContent = 'Inga aktuella varningar.';
      card.appendChild(noAlerts);
    } else {
      messages.forEach((item) => {
        const box = document.createElement('div');
        box.className = 'box';

        const district = document.createElement('div');
        district.className = 'district';
        district.textContent = item.area;

        const msg = document.createElement('div');
        msg.className = 'msg';

        msg.innerHTML = `
          <b>Typ:</b> ${item.event}<br>
          <b>Nivå:</b> ${item.level}<br>
          <b>Allvarlighetsgrad:</b> ${item.severity}<br>
          <b>Utfärdad:</b> ${new Date(item.published).toLocaleString()}<br>
          <b>Period:</b> ${new Date(item.start).toLocaleString()} - ${item.end !== 'Okänt' ? new Date(item.end).toLocaleString() : 'Okänt'}<br>
          <b>Beskrivning:</b><br>${item.details.replace(/\n/g, '<br>')}
        `;

        box.appendChild(district);
        box.appendChild(msg);
        card.appendChild(box);
      });
    }

    // Clear previous content
    while (this.shadowRoot.lastChild) {
      this.shadowRoot.removeChild(this.shadowRoot.lastChild);
    }

    this.shadowRoot.appendChild(card);
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
}

customElements.define('smhi-alert-card', SmhiAlertCard);
