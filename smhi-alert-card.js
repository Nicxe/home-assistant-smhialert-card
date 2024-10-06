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
        padding: 5px;
        margin-bottom: 5px;
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
          ${this.config.show_type ? `<b>Typ:</b> ${item.event}<br>` : ''}
          ${this.config.show_level ? `<b>Nivå:</b> ${item.level}<br>` : ''}
          ${this.config.show_severity ? `<b>Allvarlighetsgrad:</b> ${item.severity}<br>` : ''}
          ${this.config.show_published ? `<b>Utfärdad:</b> ${new Date(item.published).toLocaleString()}<br>` : ''}
          ${this.config.show_period ? `<b>Period:</b> ${new Date(item.start).toLocaleString()} - ${item.end !== 'Okänt' ? new Date(item.end).toLocaleString() : 'Okänt'}<br>` : ''}
          ${this.config.show_details ? `<b>Beskrivning:</b><br>${item.details.replace(/\n/g, '<br>')}` : ''}
        `;

        box.appendChild(district);
        box.appendChild(msg);
        card.appendChild(box);
      });
    }


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

 
  static getConfigElement() {
    return document.createElement('smhi-alert-card-editor');
  }

  static getStubConfig(hass, entities) {
    return {
      entity: entities.find((e) => e.startsWith('sensor.')) || '',
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
    return 'Displays SMHI warnings for selected regions using the  SMHI Weather Warnings & Alerts integration';
  }
}

customElements.define('smhi-alert-card', SmhiAlertCard);

class SmhiAlertCardEditor extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
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

    if (!this.shadowRoot.lastChild) {
      // Rendera bara formuläret om det inte redan finns
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
          name: 'show_published', label: 'Utfärdad',
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

      this.shadowRoot.appendChild(form);
    } else {
      // Om formuläret redan finns, uppdatera bara datan
      const form = this.shadowRoot.querySelector('ha-form');
      form.data = {
        entity: this._config.entity || '',
        title: this._config.title || '',
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
  description: 'Displays SMHI warnings for selected regions using the  SMHI Weather Warnings & Alerts integration',
});