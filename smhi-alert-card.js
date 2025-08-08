import { LitElement, html, css } from 'https://unpkg.com/lit?module';

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
    _expanded: {},
  };

  static styles = css`
    ha-card {
      padding: 8px 0;
    }
    .alerts {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 0 12px 12px 12px;
    }
    .alert {
      display: grid;
      grid-template-columns: auto 1fr auto;
      gap: 12px;
      align-items: start;
      padding: 12px;
      border-radius: var(--smhi-alert-border-radius, 8px);
      border: 1px solid var(--divider-color);
      background: var(--card-background-color);
      position: relative;
    }
    .alert::before {
      content: '';
      position: absolute;
      left: 0;
      top: 0;
      bottom: 0;
      width: 4px;
      border-top-left-radius: inherit;
      border-bottom-left-radius: inherit;
      background: var(--smhi-accent, var(--primary-color));
    }
    .alert.sev-yellow { --smhi-accent: var(--smhi-alert-yellow, #f1c40f); }
    .alert.sev-orange { --smhi-accent: var(--smhi-alert-orange, #e67e22); }
    .alert.sev-red { --smhi-accent: var(--smhi-alert-red, var(--error-color, #e74c3c)); }
    .alert.sev-message { --smhi-accent: var(--smhi-alert-message, var(--primary-color)); }

    .icon {
      width: 32px;
      height: 32px;
      margin-inline-start: 4px;
      margin-top: 2px;
    }
    .content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
    .title {
      display: flex;
      gap: 8px;
      align-items: center;
      min-width: 0;
    }
    .district {
      font-weight: 600;
      overflow: hidden;
      text-overflow: ellipsis;
      white-space: nowrap;
    }
    .meta {
      color: var(--secondary-text-color);
      font-size: 0.9em;
      display: flex;
      flex-wrap: wrap;
      gap: 8px 12px;
    }
    .details {
      margin-top: 6px;
    }
    .details-toggle {
      color: var(--primary-color);
      cursor: pointer;
      user-select: none;
      font-size: 0.95em;
    }
    .empty {
      color: var(--secondary-text-color);
      padding: 8px 12px 12px 12px;
    }
  `;

  setConfig(config) {
    if (!config.entity) {
      throw new Error('You must specify an entity.');
    }
    const normalized = this._normalizeConfig(config);
    this.config = normalized;
    this._expanded = {};
  }

  getCardSize() {
    const messages = this._visibleMessages();
    if (this.config?.hide_when_empty && (!messages || messages.length === 0)) return 0;
    const header = this._showHeader() ? 1 : 0;
    return header + (messages ? messages.length : 0);
  }

  _messages() {
    if (!this.hass || !this.config) return [];
    const stateObj = this.hass.states?.[this.config.entity];
    return stateObj ? stateObj.attributes?.messages || [] : [];
  }

  _visibleMessages() {
    const messages = this._messages();
    if (!Array.isArray(messages)) return [];
    const cfg = this.config || {};
    const filterSev = (cfg.filter_severities || []).map((s) => String(s).toUpperCase());
    const filterAreas = (cfg.filter_areas || []).map((s) => String(s).toLowerCase());

    const filtered = messages.filter((m) => {
      const code = String(m.code || '').toUpperCase();
      const area = String(m.area || '').toLowerCase();
      const sevOk = filterSev.length === 0 || filterSev.includes(code);
      const areaOk = filterAreas.length === 0 || filterAreas.some((x) => area.includes(x));
      return sevOk && areaOk;
    });

    const sorted = [...filtered].sort((a, b) => {
      const order = cfg.sort_order || 'severity_then_time';
      if (order === 'time_desc') {
        const at = new Date(a.start || a.published || 0).getTime();
        const bt = new Date(b.start || b.published || 0).getTime();
        return bt - at;
      }
      // severity_then_time
      const as = this._severityRank(a);
      const bs = this._severityRank(b);
      if (as !== bs) return bs - as; // higher first
      const at = new Date(a.start || a.published || 0).getTime();
      const bt = new Date(b.start || b.published || 0).getTime();
      return bt - at;
    });

    const max = Number(cfg.max_items || 0);
    return max > 0 ? sorted.slice(0, max) : sorted;
  }

  _severityRank(item) {
    const code = String(item?.code || '').toUpperCase();
    switch (code) {
      case 'RED':
        return 4;
      case 'ORANGE':
        return 3;
      case 'YELLOW':
        return 2;
      case 'MESSAGE':
        return 1;
      default:
        return 0;
    }
  }

  _iconTemplate(item) {
    if (item.code === 'MESSAGE') {
      const event = item.event.trim().toLowerCase();
      if (event === 'brandrisk' || event === 'fire risk') {
        return html`<img class="icon" src="${fireIcon}" alt="icon" onerror="this.onerror=null;this.src='/hacsfiles/home-assistant-smhialert-card/fire.svg';" />`;
      } else if (event === 'risk för vattenbrist' || event === 'risk for water shortage') {
        return html`<img class="icon" src="${waterShortageIcon}" alt="icon" onerror="this.onerror=null;this.src='/hacsfiles/home-assistant-smhialert-card/waterShortage.svg';" />`;
      } else if (event === 'höga temperaturer' || event === 'high temperatures') {
        return html`<img class="icon" src="${temperatureIcon}" alt="icon" onerror="this.onerror=null;this.src='/hacsfiles/home-assistant-smhialert-card/temperature.svg';" />`;
      }
      return html`<ha-icon class="icon" icon="mdi:message-alert-outline" aria-hidden="true"></ha-icon>`;
    }
    switch (item.code) {
      case 'YELLOW':
        return html`<img class="icon" src="${yellowWarningIcon}" alt="yellow" onerror="this.onerror=null;this.src='/hacsfiles/home-assistant-smhialert-card/yellowWarning.svg';" />`;
      case 'ORANGE':
        return html`<img class="icon" src="${orangeWarningIcon}" alt="orange" onerror="this.onerror=null;this.src='/hacsfiles/home-assistant-smhialert-card/orangeWarning.svg';" />`;
      case 'RED':
        return html`<img class="icon" src="${redWarningIcon}" alt="red" onerror="this.onerror=null;this.src='/hacsfiles/home-assistant-smhialert-card/redWarning.svg';" />`;
      default:
        return html`<ha-icon class="icon" icon="mdi:alert-circle-outline" aria-hidden="true"></ha-icon>`;
    }
  }

  render() {
    if (!this.hass || !this.config) return html``;
    const stateObj = this.hass.states?.[this.config.entity];
    if (!stateObj) return html``;
    const t = this._t.bind(this);
    const messages = this._visibleMessages();

    if (this.config.hide_when_empty && messages.length === 0) return html``;

    const header = this._showHeader() ? (this.config.title || stateObj.attributes?.friendly_name || 'SMHI') : undefined;

    return html`
      <ha-card .header=${header}>
        ${messages.length === 0
          ? html`<div class="empty">${t('no_alerts')}</div>`
          : html`<div class="alerts">${this._renderGrouped(messages)}</div>`}
      </ha-card>
    `;
  }

  _renderGrouped(messages) {
    const groupBy = this.config?.group_by || 'none';
    if (groupBy !== 'area') {
      return messages.map((item, idx) => this._renderAlert(item, idx));
    }
    // group by area
    const areaToItems = {};
    for (const m of messages) {
      const key = m.area || '—';
      if (!areaToItems[key]) areaToItems[key] = [];
      areaToItems[key].push(m);
    }
    const areas = Object.keys(areaToItems).sort();
    return areas.map((area) => html`
      <div class="area-group">
        <div class="meta" style="margin: 0 12px;">${area}</div>
        ${areaToItems[area].map((item, idx) => this._renderAlert(item, idx))}
      </div>
    `);
  }

  _renderAlert(item, idx) {
    const t = this._t.bind(this);
    const code = String(item.code || '').toUpperCase();
    const sevClass =
      code === 'RED' ? 'sev-red' : code === 'ORANGE' ? 'sev-orange' : code === 'YELLOW' ? 'sev-yellow' : 'sev-message';
    const expanded = !!this._expanded[this._alertKey(item, idx)];
    const showIcon = this.config.show_icon !== false;
    const parts = [];
    // Area first in meta
    if (this.config.show_area !== false && item.area) parts.push(html`<span><b>${t('area')}:</b> ${item.area}</span>`);
    if (this.config.show_type !== false && item.event) parts.push(html`<span><b>${t('type')}:</b> ${item.event}</span>`);
    if (this.config.show_level !== false && item.level) parts.push(html`<span><b>${t('level')}:</b> ${item.level}</span>`);
    if (this.config.show_severity !== false && item.severity) parts.push(html`<span><b>${t('severity')}:</b> ${item.severity}</span>`);
    if (this.config.show_published !== false && item.published) parts.push(html`<span><b>${t('published')}:</b> ${this._fmtTs(item.published)}</span>`);
    if (this.config.show_period !== false && (item.start || item.end))
      parts.push(html`<span><b>${t('period')}:</b> ${this._fmtTs(item.start)} – ${this._fmtEnd(item.end)}</span>`);
    if (this.config.show_description !== false && item.descr) {
      // Avoid duplicating description if used as title
      const titleText = item.descr || '';
      if (titleText && titleText !== (item.descr || '')) {
        parts.push(html`<span><b>${t('description_short')}:</b> ${item.descr}</span>`);
      }
    }

    return html`
      <div
        class="alert ${sevClass}"
        role="button"
        tabindex="0"
        aria-label="${item.area || ''}"
        @pointerdown=${(e) => this._onPointerDown(e)}
        @pointerup=${(e) => this._onPointerUp(e, item)}
        @keydown=${(e) => this._onKeydown(e, item)}
      >
        ${showIcon ? html`<div>${this._iconTemplate(item)}</div>` : html``}
        <div class="content">
          <div class="title">
            <div class="district">${item.descr || item.area || item.event || ''}</div>
          </div>
          ${parts.length > 0 ? html`<div class="meta">${parts}</div>` : html``}
          ${this.config.show_details !== false && item.details
            ? html`
                <div class="details">
                  <div class="details-toggle" @click=${(e) => this._toggleDetails(e, item, idx)}>
                    ${expanded ? t('hide_details') : t('show_details')}
                  </div>
                  ${expanded
                    ? html`<ha-markdown breaks .content=${String(item.details || '')}></ha-markdown>`
                    : html``}
                </div>
              `
            : html``}
        </div>
        <div></div>
      </div>`;
  }

  _toggleDetails(e, item, idx) {
    e.stopPropagation();
    const key = this._alertKey(item, idx);
    this._expanded = { ...this._expanded, [key]: !this._expanded[key] };
  }

  _onPointerDown(e) {
    if (e.button !== 0) return; // left click only
    clearTimeout(this._holdTimer);
    this._holdFired = false;
    this._holdTimer = setTimeout(() => {
      this._holdFired = true;
      // we don't know item here; handled on pointerup
    }, 500);
  }

  _onPointerUp(e, item) {
    if (e.button !== 0) return;
    clearTimeout(this._holdTimer);
    if (this._holdFired) {
      this._runAction(this.config?.hold_action || this.config?.tap_action || { action: 'more-info' }, item);
      return;
    }
    const now = Date.now();
    if (this._lastTap && now - this._lastTap < 250) {
      this._lastTap = 0;
      this._runAction(this.config?.double_tap_action || this.config?.tap_action || { action: 'more-info' }, item);
    } else {
      this._lastTap = now;
      clearTimeout(this._tapTimer);
      this._tapTimer = setTimeout(() => {
        // if no double tap happened
        if (this._lastTap && Date.now() - this._lastTap >= 250) {
          this._lastTap = 0;
          this._runAction(this.config?.tap_action || { action: 'more-info' }, item);
        }
      }, 260);
    }
  }

  _onKeydown(e, item) {
    if (e.key === 'Enter' || e.key === ' ') {
      e.preventDefault();
      this._runAction(this.config?.tap_action || { action: 'more-info' }, item);
    }
  }

  _alertKey(item, idx) {
    return `${String(item.code || '')}-${String(item.area || '')}-${String(item.start || item.published || idx)}`;
  }

  _fmtTs(value) {
    if (!value) return '';
    try {
      const d = new Date(value);
      return d.toLocaleString();
    } catch (e) {
      return String(value);
    }
  }

  _fmtEnd(end) {
    if (!end || String(end).toLowerCase() === 'okänt') return this._t('unknown');
    return this._fmtTs(end);
  }

  _showHeader() {
    return this.config?.show_header !== false;
  }

  shouldUpdate(changed) {
    if (changed.has('config')) return true;
    if (changed.has('hass')) {
      const messages = this._messages();
      const key = JSON.stringify(messages?.map((m) => [m.code, m.area, m.start, m.published]));
      if (this._lastKey !== key) {
        this._lastKey = key;
        return true;
      }
      return false;
    }
    return true;
  }

  _t(key) {
    const lang = (this.hass?.language || 'en').toLowerCase();
    const dict = {
      en: {
        no_alerts: 'No alerts',
        area: 'Area',
        type: 'Type',
        level: 'Level',
        severity: 'Severity',
        published: 'Published',
        period: 'Period',
        description_short: 'Descr',
        show_details: 'Show details',
        hide_details: 'Hide details',
        unknown: 'Unknown',
      },
      sv: {
        no_alerts: 'Inga varningar',
        area: 'Område',
        type: 'Typ',
        level: 'Nivå',
        severity: 'Allvarlighetsgrad',
        published: 'Publicerad',
        period: 'Period',
        description_short: 'Beskrivning',
        show_details: 'Visa detaljer',
        hide_details: 'Dölj detaljer',
        unknown: 'Okänt',
      },
    };
    return (dict[lang] || dict.en)[key] || key;
  }

  _normalizeConfig(config) {
    const normalized = { ...config };
    // Backwards compatibility mappings
    if (normalized.show_descr !== undefined && normalized.show_description === undefined) {
      normalized.show_description = normalized.show_descr;
    }
    // Defaults
    if (normalized.show_header === undefined) normalized.show_header = true;
    if (normalized.show_area === undefined) normalized.show_area = true;
    if (normalized.show_type === undefined) normalized.show_type = true;
    if (normalized.show_level === undefined) normalized.show_level = true;
    if (normalized.show_severity === undefined) normalized.show_severity = true;
    if (normalized.show_published === undefined) normalized.show_published = true;
    if (normalized.show_period === undefined) normalized.show_period = true;
    if (normalized.show_description === undefined) normalized.show_description = true;
    if (normalized.show_details === undefined) normalized.show_details = true;
    if (normalized.show_icon === undefined) normalized.show_icon = true;
    if (normalized.hide_when_empty === undefined) normalized.hide_when_empty = false;
    if (normalized.max_items === undefined) normalized.max_items = 0;
    if (normalized.sort_order === undefined) normalized.sort_order = 'severity_then_time';
    if (normalized.group_by === undefined) normalized.group_by = 'none';
    if (!Array.isArray(normalized.filter_severities)) normalized.filter_severities = [];
    if (!Array.isArray(normalized.filter_areas)) normalized.filter_areas = [];
    if (normalized.collapse_details === undefined) normalized.collapse_details = true;
    if (normalized.show_border === undefined) normalized.show_border = true; // kept for compat but unused
    return normalized;
  }

  static getConfigElement() {
    return document.createElement('smhi-alert-card-editor');
  }

  static getStubConfig(hass, entities) {
    return {
      entity: entities.find((e) => e.startsWith('sensor.')) || '',
      title: '',
      show_header: true,
      show_icon: true,
      show_area: true,
      show_type: true,
      show_level: true,
      show_severity: true,
      show_published: true,
      show_period: true,
      show_description: true,
      show_details: true,
      hide_when_empty: true,
      max_items: 0,
      sort_order: 'severity_then_time',
      group_by: 'none',
      filter_severities: [],
      filter_areas: [],
      collapse_details: true,
    };
  }
}

if (!customElements.get('smhi-alert-card')) {
  customElements.define('smhi-alert-card', SmhiAlertCard);
}

class SmhiAlertCardEditor extends LitElement {
  static properties = {
    hass: {},
    _config: {},
  };

  static styles = css`
    .container {
      padding: 8px 0 0 0;
    }
  `;

  setConfig(config) {
    this._config = config;
  }

  render() {
    if (!this.hass || !this._config) return html``;
    const schema = [
      { name: 'entity', label: 'Entity', required: true, selector: { entity: { domain: 'sensor' } } },
      { name: 'title', label: 'Title', selector: { text: {} } },
      { name: 'show_header', label: 'Show header', selector: { boolean: {} } },
      { name: 'show_icon', label: 'Show icon', selector: { boolean: {} } },
      { name: 'hide_when_empty', label: 'Hide when empty', selector: { boolean: {} } },
      { name: 'max_items', label: 'Max items', selector: { number: { min: 0, mode: 'box' } } },
      {
        name: 'sort_order', label: 'Sort order',
        selector: { select: { mode: 'dropdown', options: [
          { value: 'severity_then_time', label: 'Severity then time' },
          { value: 'time_desc', label: 'Time (newest first)' },
        ] } },
      },
      { name: 'group_by', label: 'Group by', selector: { select: { mode: 'dropdown', options: [
        { value: 'none', label: 'No grouping' },
        { value: 'area', label: 'By area' },
      ] } } },
      { name: 'filter_severities', label: 'Filter severities', selector: { select: { multiple: true, options: [
        { value: 'RED', label: 'RED' },
        { value: 'ORANGE', label: 'ORANGE' },
        { value: 'YELLOW', label: 'YELLOW' },
        { value: 'MESSAGE', label: 'MESSAGE' },
      ] } } },
      { name: 'filter_areas', label: 'Filter areas (comma-separated)', selector: { text: {} } },
      { name: 'collapse_details', label: 'Collapse details', selector: { boolean: {} } },
      { name: 'show_area', label: 'Show area (in meta)', selector: { boolean: {} } },
      { name: 'show_type', label: 'Show type', selector: { boolean: {} } },
      { name: 'show_level', label: 'Show level', selector: { boolean: {} } },
      { name: 'show_severity', label: 'Show severity', selector: { boolean: {} } },
      { name: 'show_published', label: 'Show published', selector: { boolean: {} } },
      { name: 'show_period', label: 'Show period', selector: { boolean: {} } },
      { name: 'show_description', label: 'Show description', selector: { boolean: {} } },
      { name: 'show_details', label: 'Show details', selector: { boolean: {} } },
      // actions (use ui_action selector for full UI in editor)
      { name: 'tap_action', label: 'Tap action', selector: { ui_action: {} } },
      { name: 'double_tap_action', label: 'Double tap action', selector: { ui_action: {} } },
      { name: 'hold_action', label: 'Hold action', selector: { ui_action: {} } },
    ];

    const data = {
      entity: this._config.entity || '',
      title: this._config.title || '',
      show_header: this._config.show_header !== undefined ? this._config.show_header : true,
      show_icon: this._config.show_icon !== undefined ? this._config.show_icon : true,
      hide_when_empty: this._config.hide_when_empty !== undefined ? this._config.hide_when_empty : true,
      max_items: this._config.max_items ?? 0,
      sort_order: this._config.sort_order || 'severity_then_time',
      group_by: this._config.group_by || 'none',
      filter_severities: this._config.filter_severities || [],
      filter_areas: (this._config.filter_areas || []).join(', '),
      collapse_details: this._config.collapse_details !== undefined ? this._config.collapse_details : true,
      show_area: this._config.show_area !== undefined ? this._config.show_area : true,
      show_type: this._config.show_type !== undefined ? this._config.show_type : true,
      show_level: this._config.show_level !== undefined ? this._config.show_level : true,
      show_severity: this._config.show_severity !== undefined ? this._config.show_severity : true,
      show_published: this._config.show_published !== undefined ? this._config.show_published : true,
      show_period: this._config.show_period !== undefined ? this._config.show_period : true,
      show_description: this._config.show_description !== undefined ? this._config.show_description : true,
      show_details: this._config.show_details !== undefined ? this._config.show_details : true,
      tap_action: this._config.tap_action || {},
      double_tap_action: this._config.double_tap_action || {},
      hold_action: this._config.hold_action || {},
    };

    return html`
      <div class="container">
        <ha-form
          .hass=${this.hass}
          .data=${data}
          .schema=${schema}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._valueChanged}
        ></ha-form>
      </div>
    `;
  }

  _valueChanged = (ev) => {
    if (!this._config || !this.hass) return;
    const value = ev.detail?.value || {};
    const next = { ...this._config, ...value };
    // normalize filter_areas from comma-separated string
    if (typeof next.filter_areas === 'string') {
      next.filter_areas = next.filter_areas
        .split(',')
        .map((s) => s.trim())
        .filter(Boolean);
    }
    this._config = next;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: next } }));
  };

  _computeLabel = (schema) => {
    const labels = {
      entity: 'Entity',
      title: 'Title',
      show_header: 'Show header',
      show_icon: 'Show icon',
      hide_when_empty: 'Hide when empty',
      max_items: 'Max items',
      sort_order: 'Sort order',
      group_by: 'Group by',
      filter_severities: 'Filter severities',
      filter_areas: 'Filter areas (comma-separated)',
      collapse_details: 'Collapse details',
      show_type: 'Show type',
      show_level: 'Show level',
      show_severity: 'Show severity',
      show_published: 'Show published',
      show_period: 'Show period',
      show_description: 'Show description',
      show_details: 'Show details',
      tap_action: 'Tap action',
      double_tap_action: 'Double tap action',
      hold_action: 'Hold action',
    };
    return labels[schema.name] || schema.name;
  };
}

if (!customElements.get('smhi-alert-card-editor')) {
  customElements.define('smhi-alert-card-editor', SmhiAlertCardEditor);
}

// Register the card so it appears in the "Add card" dialog
window.customCards = window.customCards || [];
window.customCards.push({
  type: 'smhi-alert-card',
  name: 'SMHI Alert Card',
  description: 'Displays SMHI warnings for selected regions using the SMHI Weather Warnings & Alerts integration',
  preview: true,
});

// Actions support
SmhiAlertCard.prototype._onRowAction = function (e, item) {
  // Only trigger card action when clicking outside the toggle link
  const tag = (e.composedPath?.()[0]?.tagName || '').toLowerCase();
  if (tag === 'ha-markdown' || (e.target && e.target.classList && e.target.classList.contains('details-toggle'))) {
    return;
  }
  const action = this.config?.tap_action || { action: 'more-info' };
  this._runAction(action, item);
};

SmhiAlertCard.prototype._onKeydown = function (e, item) {
  if (e.key === 'Enter' || e.key === ' ') {
    e.preventDefault();
    const action = this.config?.tap_action || { action: 'more-info' };
    this._runAction(action, item);
  }
};

SmhiAlertCard.prototype._runAction = function (action, item) {
  const a = action?.action || 'more-info';
  if (a === 'none') return;
  if (a === 'more-info') {
    const ev = new CustomEvent('hass-more-info', { bubbles: true, composed: true, detail: { entityId: this.config.entity } });
    this.dispatchEvent(ev);
    return;
  }
  if (a === 'navigate' && action.navigation_path) {
    history.pushState(null, '', action.navigation_path);
    const ev = new Event('location-changed', { bubbles: true, composed: true });
    this.dispatchEvent(ev);
    return;
  }
  if (a === 'url' && action.url_path) {
    window.open(action.url_path, '_blank');
    return;
  }
  if (a === 'call-service' && action.service) {
    const [domain, service] = action.service.split('.');
    this.hass.callService(domain, service, action.service_data || {});
    return;
  }
};
