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
              iconElement = `<img class="box-icon" src="/local/community/home-assistant-smhialert-card/fire.svg" />`;
            } else if (event === 'risk för vattenbrist' || event === 'risk for water shortage') {
              iconElement = `<img class="box-icon" src="/local/community/home-assistant-smhialert-card/water-shortage.svg" />`;
            } else if (event === 'höga temperaturer' || event === 'high temperatures') {
              iconElement = `<img class="box-icon" src="/local/community/home-assistant-smhialert-card/temperature.svg" />`;
            } else {
              // Standardikon om 'event' inte känns igen
              iconElement = `<ha-icon class="box-icon" icon="mdi:message-alert-outline"></ha-icon>`;
            }
          } else {
            // För andra koder, använd befintliga ikoner
            switch (item.code) {
              case 'YELLOW':
                iconElement = `<img class="box-icon" src="/local/community/home-assistant-smhialert-card/yellow_warning.svg" />`;
                break;
              case 'ORANGE':
                iconElement = `<img class="box-icon" src="/local/community/home-assistant-smhialert-card/orange_warning.svg" />`;
                break;
              case 'RED':
                iconElement = `<img class="box-icon" src="/local/community/home-assistant-smhialert-card/red_warning.svg" />`;
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
  