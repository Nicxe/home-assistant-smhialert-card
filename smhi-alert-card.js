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
    :host {
      /* Strength of the severity-tinted background when enabled (used in color-mix) */
      --smhi-alert-bg-strong: 22%;
      --smhi-alert-bg-soft: 12%;
      /* Optical vertical adjustment for the title in compact (1-row) mode */
      --smhi-alert-compact-title-offset: 2px;
      display: block;
    }

    ha-card {
      padding: 8px 0;
      background: transparent;
      box-shadow: none;
      border: none;
      --ha-card-background: transparent;
      --ha-card-border-width: 0;
      --ha-card-border-color: transparent;
    }
    .alerts {
      display: flex;
      flex-direction: column;
      gap: 8px;
      padding: 0 12px 12px 12px;
    }
    .area-group {
      display: flex;
      flex-direction: column;
      gap: 8px;
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
    /* Compact (single-line) layout: vertically center the whole row */
    .alert.compact {
      align-items: center;
    }

    /* Optional severity-tinted background (keeps normal card background as base) */
    .alert.bg-severity {
      background: linear-gradient(
          90deg,
          color-mix(in srgb, var(--smhi-accent) var(--smhi-alert-bg-strong, 22%), var(--card-background-color)) 0%,
          color-mix(in srgb, var(--smhi-accent) var(--smhi-alert-bg-soft, 12%), var(--card-background-color)) 55%,
          var(--card-background-color) 100%
        );
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
    .icon-col {
      display: flex;
      align-items: flex-start;
    }
    .icon-col.compact {
      align-items: center;
    }
    .content {
      display: flex;
      flex-direction: column;
      gap: 4px;
      min-width: 0;
    }
    /* Allow the content column to fill the alert height in normal (multi-line) layout */
    .content {
      align-self: stretch;
    }
    /* In compact layout, don't stretch the content; let the grid center it precisely */
    .content.compact {
      align-self: center;
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
    /* In compact mode, apply a tiny optical offset so the text looks centered */
    .district.compact {
      transform: translateY(var(--smhi-alert-compact-title-offset, 1px));
      line-height: 1;
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
    .md-text {
      white-space: pre-wrap;
      line-height: 1.5;
      font-family: inherit;
      font-size: 0.95em;
      color: var(--primary-text-color);
      overflow-wrap: anywhere;
    }
    .details-toggle {
      color: var(--primary-color);
      cursor: pointer;
      user-select: none;
      font-size: 0.95em;
      margin-bottom: 6px;
    }
    .toggle-col {
      display: flex;
      justify-content: flex-end;
      align-items: flex-start;
      padding-top: 2px;
      padding-right: 2px;
    }
    .toggle-col.compact {
      align-items: center;
      padding-top: 0;
    }
    /* Compact toggle when placed in the right column (prevents it from consuming an extra line) */
    .details-toggle.compact {
      margin: 0;
      font-size: 0.9em;
      white-space: nowrap;
    }
    /* Ensure consistent spacing when details are expanded */
    .details .meta + .md-text { margin-top: 6px; }
    .empty {
      color: var(--secondary-text-color);
      padding: 8px 12px 12px 12px;
    }

    /* Editor-only controls */
    .meta-fields { margin: 12px 0; padding: 0 12px; }
    .meta-row { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 8px; padding: 6px 0; }
    .order-actions { display: flex; gap: 6px; }
    .order-btn { background: var(--secondary-background-color); color: var(--primary-text-color); border: 1px solid var(--divider-color); border-radius: 4px; padding: 2px 6px; cursor: pointer; }
    .order-btn[disabled] { opacity: 0.4; cursor: default; }
    .meta-divider-row { display: grid; grid-template-columns: 1fr auto; align-items: center; gap: 8px; padding: 6px 0; color: var(--secondary-text-color); }
    .meta-divider { border-top: 1px dashed var(--divider-color); height: 0; }
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

  /**
   * Sections (grid) view support.
   * Home Assistant uses this to determine the default/min size and to enable the UI "Layout" tab resizing.
   * Each section is 12 columns wide.
   */
  getGridOptions() {
    // Provide only column sizing. Avoid returning `rows` here so Sections can auto-size height
    // based on content (prevents fixed-height behavior and overlap issues when expanding).
    return {
      columns: 12,
      min_columns: 1,
      max_columns: 12,
    };
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
        ${this._renderEditorMetaControls?.() || html``}
      </ha-card>
    `;
  }

  _renderGrouped(messages) {
    const groupBy = this.config?.group_by || 'none';
    if (groupBy === 'none') {
      return messages.map((item, idx) => this._renderAlert(item, idx));
    }
    const groups = {};
    const getKey = (m) => {
      if (groupBy === 'area') return m.area || '—';
      if (groupBy === 'type') return m.event || '—';
      if (groupBy === 'level') return m.level || '—';
      if (groupBy === 'severity') return (m.code || '—');
      return '—';
    };
    for (const m of messages) {
      const key = getKey(m);
      if (!groups[key]) groups[key] = [];
      groups[key].push(m);
    }
    let keys = Object.keys(groups);
    if (groupBy === 'severity') {
      keys.sort((a, b) => {
        const ra = this._severityRank({ code: String(a).toUpperCase() });
        const rb = this._severityRank({ code: String(b).toUpperCase() });
        return rb - ra;
      });
    } else {
      keys.sort((a, b) => String(a).localeCompare(String(b)));
    }
    return keys.map((key) => html`
      <div class="area-group">
        <div class="meta" style="margin: 0 12px;">${key}</div>
        ${groups[key].map((item, idx) => this._renderAlert(item, idx))}
      </div>
    `);
  }

  _renderAlert(item, idx) {
    const t = this._t.bind(this);
    const code = String(item.code || '').toUpperCase();
    const sevClass =
      code === 'RED' ? 'sev-red' : code === 'ORANGE' ? 'sev-orange' : code === 'YELLOW' ? 'sev-yellow' : 'sev-message';
    const sevBgClass = this.config?.severity_background ? 'bg-severity' : '';
    const showIcon = this.config.show_icon !== false;
    const metaFields = {
      area: (this.config.show_area !== false && item.area)
        ? html`<span><b>${t('area')}:</b> ${item.area}</span>`
        : null,
      type: (this.config.show_type !== false && item.event)
        ? html`<span><b>${t('type')}:</b> ${item.event}</span>`
        : null,
      level: (this.config.show_level !== false && item.level)
        ? html`<span><b>${t('level')}:</b> ${item.level}</span>`
        : null,
      severity: (this.config.show_severity !== false && item.severity)
        ? html`<span><b>${t('severity')}:</b> ${item.severity}</span>`
        : null,
      published: (this.config.show_published !== false && item.published)
        ? html`<span><b>${t('published')}:</b> ${this._fmtTs(item.published)}</span>`
        : null,
      period: (this.config.show_period !== false && (item.start || item.end))
        ? html`<span><b>${t('period')}:</b> ${this._fmtTs(item.start)} – ${this._fmtEnd(item.end)}</span>`
        : null,
      text: (this.config.show_text !== false && this._detailsText(item))
        ? (() => {
            const textContent = this._normalizeMultiline(this._detailsText(item));
            return html`<div class="md-text">${textContent}</div>`;
          })()
        : null,
    };
    // Build ordered meta with optional divider and collapsible section
    const defaultOrder = ['area','type','level','severity','published','period','divider','text'];
    const rawOrder = Array.isArray(this.config.meta_order) && this.config.meta_order.length
      ? this.config.meta_order
      : defaultOrder;
    // Ensure divider and text exist in order exactly once
    let order = rawOrder.filter((k, i) => rawOrder.indexOf(k) === i);
    if (!order.includes('divider')) order = [...order, 'divider'];
    if (!order.includes('text')) order = [...order, 'text'];

    const dividerIndex = order.indexOf('divider');
    const inlineKeys = dividerIndex >= 0 ? order.slice(0, dividerIndex) : order.filter((k) => k !== 'divider');
    const detailsKeys = dividerIndex >= 0 ? order.slice(dividerIndex + 1) : [];

    const inlineParts = inlineKeys
      .filter((k) => k !== 'text')
      .map((key) => metaFields[key])
      .filter((node) => !!node);

    const inlineTextBlock = inlineKeys.includes('text') ? metaFields.text : null;

    const detailsParts = detailsKeys
      .filter((k) => k !== 'text')
      .map((key) => metaFields[key])
      .filter((node) => !!node);
    const detailsTextBlock = detailsKeys.includes('text') ? metaFields.text : null;

    // Default expansion: keep details collapsed unless user expands
    const key = this._alertKey(item, idx);
    const hasStored = Object.prototype.hasOwnProperty.call(this._expanded || {}, key);
    let expanded = hasStored ? !!this._expanded[key] : false;
    // no auto-expand
    const expandable = (detailsParts.length > 0 || !!detailsTextBlock);
    const isCompact = !expanded && inlineParts.length === 0 && !inlineTextBlock;

    return html`
      <div
        class="alert ${sevClass} ${sevBgClass} ${isCompact ? 'compact' : ''}"
        role="button"
        tabindex="0"
        aria-label="${item.area || ''}"
        @pointerdown=${(e) => this._onPointerDown(e)}
        @pointerup=${(e) => this._onPointerUp(e, item)}
        @keydown=${(e) => this._onKeydown(e, item)}
      >
        ${showIcon ? html`<div class="icon-col ${isCompact ? 'compact' : ''}">${this._iconTemplate(item)}</div>` : html``}
        <div class="content ${isCompact ? 'compact' : ''}">
          <div class="title">
            <div class="district ${isCompact ? 'compact' : ''}">${item.descr || item.area || item.event || ''}</div>
          </div>
          ${inlineParts.length > 0 ? html`<div class="meta">${inlineParts}</div>` : html``}
          ${inlineTextBlock ? html`<div class="details">${inlineTextBlock}</div>` : html``}
          ${expandable
            ? html`
                <div class="details">
                  ${expanded ? html`
                    ${detailsParts.length > 0 ? html`<div class="meta">${detailsParts}</div>` : html``}
                    ${detailsTextBlock ? html`${detailsTextBlock}` : html``}
                  ` : html``}
                </div>
              `
            : html``}
        </div>
        ${expandable ? html`
          <div class="toggle-col ${isCompact ? 'compact' : ''}">
            <div
              class="details-toggle compact"
              role="button"
              tabindex="0"
              title="${expanded ? t('hide_details') : t('show_details')}"
              @click=${(e) => this._toggleDetails(e, item, idx)}
              @pointerdown=${(e) => e.stopPropagation()}
              @pointerup=${(e) => e.stopPropagation()}
              @keydown=${(e) => {
                if (e.key === 'Enter' || e.key === ' ') {
                  e.preventDefault();
                  this._toggleDetails(e, item, idx);
                }
                e.stopPropagation();
              }}
            >
              ${expanded ? t('hide_details') : t('show_details')}
            </div>
          </div>
        ` : html`<div></div>`}
      </div>`;
  }

  _detailsText(item) {
    // Prefer details; fall back to descr; ensure string
    const primary = item?.details;
    const fallback = item?.descr;
    const text = (primary && String(primary).trim().length > 0)
      ? String(primary)
      : (fallback && String(fallback).trim().length > 0)
        ? String(fallback)
        : '';
    return text || '';
  }

  _normalizeMultiline(value) {
    if (!value) return '';
    let text = String(value).replace(/\r\n?/g, '\n');
    // Trim leading/trailing empty lines
    text = text.replace(/^\s*\n/, '').replace(/\n\s*$/, '');
    const lines = text.split('\n');
    // Determine common leading indent among non-empty lines, preferring positive indents.
    // This avoids the first unindented heading line forcing minIndent to 0
    const indents = lines
      .filter((ln) => ln.trim().length > 0)
      .map((ln) => {
        const m = ln.match(/^(\s*)/);
        return m ? m[1].length : 0;
      });
    const positive = indents.filter((n) => n > 0);
    const minIndent = positive.length > 0 ? Math.min(...positive) : (indents.length > 0 ? Math.min(...indents) : 0);
    const deindented = lines.map((ln) => (minIndent > 0 && ln.startsWith(' '.repeat(minIndent)) ? ln.slice(minIndent) : ln));
    return deindented.join('\n');
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
    const val = String(end || '').trim().toLowerCase();
    if (!end || val === 'okänt' || val === 'unknown') return this._t('unknown');
    return this._fmtTs(end);
  }

  _showHeader() {
    return this.config?.show_header !== false;
  }

  shouldUpdate(changed) {
    if (changed.has('config')) return true;
    if (changed.has('hass')) {
      const stateObj = this.hass.states?.[this.config.entity];
      const lastUpdate = String(stateObj?.attributes?.last_update || '');
      const messages = stateObj?.attributes?.messages || [];
      // Include details/descr to re-render when description text changes
      const msgKey = JSON.stringify(messages?.map((m) => [m.code, m.area, m.start, m.published, m.details, m.descr]));
      const combinedKey = `${lastUpdate}|${msgKey}`;
      if (this._lastKey !== combinedKey) {
        this._lastKey = combinedKey;
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
        // description_short kept for backward compat but unused
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
        // description_short kept for backward compat but unused
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
    if (normalized.show_text === undefined && normalized.show_details !== undefined) {
      normalized.show_text = normalized.show_details;
    }
    // Defaults
    if (normalized.show_header === undefined) normalized.show_header = true;
    if (normalized.show_area === undefined) normalized.show_area = true;
    if (normalized.show_type === undefined) normalized.show_type = true;
    if (normalized.show_level === undefined) normalized.show_level = true;
    if (normalized.show_severity === undefined) normalized.show_severity = true;
    if (normalized.show_published === undefined) normalized.show_published = true;
    if (normalized.show_period === undefined) normalized.show_period = true;
    if (normalized.show_text === undefined) normalized.show_text = true;
    if (normalized.show_icon === undefined) normalized.show_icon = true;
    if (normalized.severity_background === undefined) normalized.severity_background = false;
    if (normalized.hide_when_empty === undefined) normalized.hide_when_empty = false;
    if (normalized.max_items === undefined) normalized.max_items = 0;
    if (normalized.sort_order === undefined) normalized.sort_order = 'severity_then_time';
    if (normalized.group_by === undefined) normalized.group_by = 'none';
    if (!Array.isArray(normalized.meta_order) || normalized.meta_order.length === 0) {
      // Default to placing text in the details section (after divider)
      normalized.meta_order = ['area','type','level','severity','published','period','divider','text'];
    } else {
      // Ensure divider and text exist
      if (!normalized.meta_order.includes('divider')) normalized.meta_order = [...normalized.meta_order, 'divider'];
      if (!normalized.meta_order.includes('text')) normalized.meta_order = [...normalized.meta_order, 'text'];
    }
    if (!Array.isArray(normalized.filter_severities)) normalized.filter_severities = [];
    if (!Array.isArray(normalized.filter_areas)) normalized.filter_areas = [];
    // collapse_details is no longer used; collapse is inferred by divider position
    delete normalized.collapse_details;
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
      severity_background: false,
      show_area: true,
      show_type: true,
      show_level: true,
      show_severity: true,
      show_published: true,
      show_period: true,
      show_text: true,
      hide_when_empty: true,
      max_items: 0,
      sort_order: 'severity_then_time',
      group_by: 'none',
      filter_severities: [],
      filter_areas: [],
      // collapse inferred by divider; default puts text in details (after divider)
      meta_order: ['area','type','level','severity','published','period','divider','text'],
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
    .container { padding: 8px 0 0 0; }
    .meta-fields { margin: 12px 0; padding: 8px 12px; }
    .meta-fields-title { color: var(--secondary-text-color); margin-bottom: 6px; }
    .meta-row { display: grid; grid-template-columns: 1fr auto auto; align-items: center; gap: 8px; padding: 6px 0; }
    .order-actions { display: flex; gap: 6px; }
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
      { name: 'severity_background', label: 'Severity background', selector: { boolean: {} } },
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
        { value: 'type', label: 'By type' },
        { value: 'level', label: 'By level' },
        { value: 'severity', label: 'By severity' },
      ] } } },
      { name: 'filter_severities', label: 'Filter severities', selector: { select: { multiple: true, options: [
        { value: 'RED', label: 'RED' },
        { value: 'ORANGE', label: 'ORANGE' },
        { value: 'YELLOW', label: 'YELLOW' },
        { value: 'MESSAGE', label: 'MESSAGE' },
      ] } } },
      { name: 'filter_areas', label: 'Filter areas (comma-separated)', selector: { text: {} } },
      // No explicit collapse or show_text; details are inferred by divider & per-meta toggles
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
      severity_background: this._config.severity_background !== undefined ? this._config.severity_background : false,
      hide_when_empty: this._config.hide_when_empty !== undefined ? this._config.hide_when_empty : true,
      max_items: this._config.max_items ?? 0,
      sort_order: this._config.sort_order || 'severity_then_time',
      group_by: this._config.group_by || 'none',
      filter_severities: this._config.filter_severities || [],
      filter_areas: (this._config.filter_areas || []).join(', '),
      // collapse inferred by divider
      show_area: this._config.show_area !== undefined ? this._config.show_area : true,
      show_type: this._config.show_type !== undefined ? this._config.show_type : true,
      show_level: this._config.show_level !== undefined ? this._config.show_level : true,
      show_severity: this._config.show_severity !== undefined ? this._config.show_severity : true,
      show_published: this._config.show_published !== undefined ? this._config.show_published : true,
      show_period: this._config.show_period !== undefined ? this._config.show_period : true,
      show_text: this._config.show_text !== undefined ? this._config.show_text : (this._config.show_details !== undefined ? this._config.show_details : true),
      tap_action: this._config.tap_action || {},
      double_tap_action: this._config.double_tap_action || {},
      hold_action: this._config.hold_action || {},
    };

    const allowed = ['area','type','level','severity','published','period'];
    const special = ['divider','text'];
    const allowedWithSpecial = [...allowed, ...special];
    const currentOrderRaw = (this._config.meta_order && Array.isArray(this._config.meta_order) && this._config.meta_order.length)
      ? this._config.meta_order.filter((k) => allowedWithSpecial.includes(k))
      : ['area','type','level','severity','published','period','divider','text'];
    // ensure presence
    let currentOrder = [...currentOrderRaw];
    if (!currentOrder.includes('divider')) currentOrder.push('divider');
    if (!currentOrder.includes('text')) currentOrder.push('text');
    const filledOrder = [...currentOrder, ...allowedWithSpecial.filter((k) => !currentOrder.includes(k))];

    const schemaTop = schema.filter((s) => !['tap_action','double_tap_action','hold_action'].includes(s.name));
    const schemaActions = schema.filter((s) => ['tap_action','double_tap_action','hold_action'].includes(s.name));

    return html`
      <div class="container">
        <ha-form
          .hass=${this.hass}
          .data=${data}
          .schema=${schemaTop}
          .computeLabel=${this._computeLabel}
          @value-changed=${this._valueChanged}
        ></ha-form>
        <div class="meta-fields">
          ${filledOrder.map((key, index) => {
            if (key === 'divider') {
              return html`
                <ha-settings-row class="meta-divider-row">
                  <span slot="heading">Details divider</span>
                  <div class="order-actions">
                    <mwc-icon-button @click=${() => this._moveMeta(key, -1)} .disabled=${index === 0} aria-label="Move up">
                      <ha-icon icon="mdi:chevron-up"></ha-icon>
                    </mwc-icon-button>
                    <mwc-icon-button @click=${() => this._moveMeta(key, 1)} .disabled=${index === filledOrder.length - 1} aria-label="Move down">
                      <ha-icon icon="mdi:chevron-down"></ha-icon>
                    </mwc-icon-button>
                  </div>
                </ha-settings-row>
              `;
            }
            return html`
              <ha-settings-row class="meta-row">
                <span slot="heading">${this._labelForMeta(key)}</span>
                <span slot="description"></span>
                <div class="order-actions">
                  <mwc-icon-button @click=${() => this._moveMeta(key, -1)} .disabled=${index === 0} aria-label="Move up">
                    <ha-icon icon="mdi:chevron-up"></ha-icon>
                  </mwc-icon-button>
                  <mwc-icon-button @click=${() => this._moveMeta(key, 1)} .disabled=${index === filledOrder.length - 1} aria-label="Move down">
                    <ha-icon icon="mdi:chevron-down"></ha-icon>
                  </mwc-icon-button>
                </div>
                <ha-switch
                  .checked=${this._isMetaShown(key)}
                  @change=${(e) => this._toggleMeta(key, e)}
                ></ha-switch>
              </ha-settings-row>`;
          })}
        </div>
        <ha-form
          .hass=${this.hass}
          .data=${data}
          .schema=${schemaActions}
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

  _isMetaShown(key) {
    if (key === 'area') return this._config.show_area !== false;
    if (key === 'type') return this._config.show_type !== false;
    if (key === 'level') return this._config.show_level !== false;
    if (key === 'severity') return this._config.show_severity !== false;
    if (key === 'published') return this._config.show_published !== false;
    if (key === 'period') return this._config.show_period !== false;
    if (key === 'text') return this._config.show_text !== false;
    if (key === 'divider') return true;
    return true;
  }

  _toggleMeta(key, ev) {
    const on = ev?.target?.checked ?? true;
    let next = { ...this._config };
    if (key === 'area') next.show_area = on;
    else if (key === 'type') next.show_type = on;
    else if (key === 'level') next.show_level = on;
    else if (key === 'severity') next.show_severity = on;
    else if (key === 'published') next.show_published = on;
    else if (key === 'period') next.show_period = on;
    else if (key === 'text') next.show_text = on;
    this._config = next;
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: next } }));
  }

  _moveMeta(key, delta) {
    // Normalize to the same order the UI renders (includes 'divider' and 'text' and all allowed keys),
    // so moving across the divider is always possible and saved back stably.
    const baseKeys = ['area','type','level','severity','published','period'];
    const specialKeys = ['divider','text'];
    const allKeys = [...baseKeys, ...specialKeys];
    const raw = (this._config.meta_order && Array.isArray(this._config.meta_order) && this._config.meta_order.length)
      ? this._config.meta_order.filter((k) => allKeys.includes(k))
      : [...allKeys];
    // Deduplicate while preserving first occurrence
    let current = raw.filter((k, i) => raw.indexOf(k) === i);
    // Ensure presence of divider/text
    if (!current.includes('divider')) current.push('divider');
    if (!current.includes('text')) current.push('text');
    // Ensure all allowed keys are present so their relative order is explicit
    const filled = [...current, ...allKeys.filter((k) => !current.includes(k))];

    const idx = filled.indexOf(key);
    if (idx < 0) return;
    const newIdx = Math.max(0, Math.min(filled.length - 1, idx + delta));
    if (newIdx === idx) return;
    const next = [...filled];
    next.splice(idx, 1);
    next.splice(newIdx, 0, key);
    this._config = { ...this._config, meta_order: next };
    this.dispatchEvent(new CustomEvent('config-changed', { detail: { config: this._config } }));
  }

  _labelForMeta(key) {
    const map = { area: 'Area', type: 'Type', level: 'Level', severity: 'Severity', published: 'Published', period: 'Period', text: 'Text', divider: '— Details —' };
    return map[key] || key;
  }

  _computeLabel = (schema) => {
    const labels = {
      entity: 'Entity',
      title: 'Title',
      show_header: 'Show header',
      show_icon: 'Show icon',
      severity_background: 'Severity background',
      hide_when_empty: 'Hide when empty',
      max_items: 'Max items',
      sort_order: 'Sort order',
      group_by: 'Group by',
      filter_severities: 'Filter severities',
      filter_areas: 'Filter areas (comma-separated)',
       // collapse_details removed
      show_area: 'Show area',
      show_type: 'Show type',
      show_level: 'Show level',
      show_severity: 'Show severity',
      show_published: 'Show published',
      show_period: 'Show period',
       // show_text is controlled as a meta toggle, not a top-level control
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
