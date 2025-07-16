import { LitElement, html, css } from 'https://unpkg.com/lit?module';
import { unsafeHTML } from 'https://unpkg.com/lit/directives/unsafe-html.js?module';

const fireIcon = new URL('./fire.svg', import.meta.url).href;
const waterShortageIcon = new URL('./waterShortage.svg', import.meta.url).href;
const temperatureIcon = new URL('./temperature.svg', import.meta.url).href;
const yellowWarningIcon = new URL('./yellowWarning.svg', import.meta.url).href;
const orangeWarningIcon = new URL('./orangeWarning.svg', import.meta.url).href;
const redWarningIcon = new URL('./redWarning.svg', import.meta.url).href;

class SmhiAlertCard extends LitElement {
  static properties = {
    hass: {},
    config: {},
  };

  static styles = css`
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

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You must specify an entity.');
    }
    this.config = config;
  }

  getCardSize() {
    const messages = this._messages();
    return 1 + (messages ? messages.length : 0);
  }

  _messages() {
    if (!this.hass || !this.config) return [];
    const stateObj = this.hass.states[this.config.entity];
    return stateObj ? stateObj.attributes.messages || [] : [];
  }

  _iconTemplate(item) {
    if (item.code === 'MESSAGE') {
      const event = item.event.trim().toLowerCase();
      if (event === 'brandrisk' || event === 'fire risk') {
        return html`<img class="box-icon" src="${fireIcon}" />`;
      } else if (event === 'risk för vattenbrist' || event === 'risk for water shortage') {
        return html`<img class="box-icon" src="${waterShortageIcon}" />`;
      } else if (event === 'höga temperaturer' || event === 'high temperatures') {
        return html`<img class="box-icon" src="${temperatureIcon}" />`;
      }
      return html`<ha-icon class="box-icon" icon="mdi:message-alert-outline"></ha-icon>`;
    }
    switch (item.code) {
      case 'YELLOW':
        return html`<img class="box-icon" src="${yellowWarningIcon}" />`;
      case 'ORANGE':
        return html`<img class="box-icon" src="${orangeWarningIcon}" />`;
      case 'RED':
        return html`<img class="box-icon" src="${redWarningIcon}" />`;
      default:
        return html`<ha-icon class="box-icon" icon="mdi:alert-circle-outline"></ha-icon>`;
    }
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const stateObj = this.hass.states[this.config.entity];
    if (!stateObj) return html``;
    const messages = stateObj.attributes.messages || [];
    return html`
      <ha-card>
        ${this.config.show_header !== false
          ? html`<div class="header"><div class="name">${this.config.title || stateObj.attributes.friendly_name}</div></div>`
          : html``}
        ${messages.length === 0
          ? html`<div class="noalerts">No alerts</div>`
          : messages.map(
              (item) => html`
                <div class="box" style="${this.config.show_border === false ? 'border:none;' : 'border:1px solid var(--primary-color);'}">
                  <div class="box-header">
                    ${this._iconTemplate(item)}
                    <div class="district">${item.area}</div>
                  </div>
                  <div class="msg">
                    ${this.config.show_type ? html`<b>Type:</b> ${item.event}<br>` : ''}
                    ${this.config.show_level ? html`<b>Level:</b> ${item.level}<br>` : ''}
                    ${this.config.show_severity ? html`<b>Severity:</b> ${item.severity}<br>` : ''}
                    ${this.config.show_published ? html`<b>Published:</b> ${new Date(item.published).toLocaleString()}<br>` : ''}
                    ${this.config.show_period
                      ? html`<b>Period:</b> ${new Date(item.start).toLocaleString()} - ${item.end !== 'Okänt' ? new Date(item.end).toLocaleString() : 'Okänt'}<br>`
                      : ''}
                    ${this.config.show_descr ? html`<b>Descr:</b> ${item.descr}<br>` : ''}
                    ${this.config.show_details ? html`<b>Description:</b><br>${unsafeHTML(item.details.replace(/\n/g, '<br>'))}` : ''}
                  </div>
                </div>
              `
            )}
      </ha-card>
    `;
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
      show_descr: true,
      show_details: true,
      show_border: true,
    };
  }
}

customElements.define('smhi-alert-card', SmhiAlertCard);

class SmhiAlertCardEditor extends HTMLElement {
  constructor() {
    super();
    // Remove Shadow DOM to ensure access to ha-form
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
        { name: 'show_header', selector: { boolean: {} } },
        { name: 'show_type', selector: { boolean: {} } },
        { name: 'show_level', selector: { boolean: {} } },
        { name: 'show_severity', selector: { boolean: {} } },
        { name: 'show_published', selector: { boolean: {} } },
        { name: 'show_period', selector: { boolean: {} } },
        { name: 'show_descr', selector: { boolean: {} } },
        { name: 'show_details', selector: { boolean: {} } },
        { name: 'show_border', selector: { boolean: {} } },
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
        show_descr: this._config.show_descr !== undefined ? this._config.show_descr : true,
        show_details: this._config.show_details !== undefined ? this._config.show_details : true,
        show_border: this._config.show_border !== undefined ? this._config.show_border : true,
      };

      const form = document.createElement('ha-form');
      form.schema = schema;
      form.data = data;
      form.hass = this._hass;

      // Listen for changes in the form
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
        show_descr: this._config.show_descr !== undefined ? this._config.show_descr : true,
        show_details: this._config.show_details !== undefined ? this._config.show_details : true,
        show_border: this._config.show_border !== undefined ? this._config.show_border : true,
      };
    }
  }
}

customElements.define('smhi-alert-card-editor', SmhiAlertCardEditor);

// Register the card so it appears in the "Add card" dialog
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'smhi-alert-card',
  name: 'SMHI Alert Card',
  description: 'Displays SMHI warnings for selected regions using the SMHI Weather Warnings & Alerts integration',
});
