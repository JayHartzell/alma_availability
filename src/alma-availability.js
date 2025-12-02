/**
 * SRU API utilities for querying Alma
 */
class SruClient {
  /**
   * Build SRU query URL
   * @param {string} baseUrl - Base SRU endpoint URL
   * @param {string} institutionCode - Institution code in Alma
   * @param {string} mmsId - Bibliographic record ID
   * @returns {string} - Full SRU query URL
   */
  static buildQueryUrl(baseUrl, institutionCode, mmsId) {
    const params = new URLSearchParams({
      version: '1.2',
      operation: 'searchRetrieve',
      recordSchema: 'marcxml',
      query: `alma.mms_id=${mmsId}`
    });
    
    const baseUrlTrimmed = baseUrl.endsWith('/') ? baseUrl.slice(0, -1) : baseUrl;
    return `${baseUrlTrimmed}/view/sru/${institutionCode}?${params.toString()}`;
  }

  /**
   * Fetch SRU XML response
   * @param {string} url - SRU query URL
   * @returns {Promise<Document>} - Parsed XML document
   * @throws {Error} - On network or parsing errors
   */
  static async fetchXml(url) {
    try {
      const response = await fetch(url);
      if (!response.ok) {
        throw new Error(`HTTP ${response.status}: ${response.statusText}`);
      }
      
      const text = await response.text();
      const parser = new DOMParser();
      const doc = parser.parseFromString(text, 'application/xml');
      
      // Check for XML parsing errors
      if (doc.getElementsByTagName('parsererror').length > 0) {
        throw new Error('Failed to parse XML response');
      }
      
      return doc;
    } catch (error) {
      if (error instanceof TypeError) {
        throw new Error(`Network error: ${error.message}`);
      }
      throw error;
    }
  }
}

/**
 * MARCXML parser utilities
 */
class MarcxmlParser {
  /**
   * Extract all AVA fields from MARCXML document
   * @param {Document} xmlDoc - Parsed XML document
   * @returns {Array<Object>} - Array of AVA field data
   */
  static extractAvaFields(xmlDoc) {
    const avaFields = [];
    const datafields = xmlDoc.querySelectorAll('datafield[tag="AVA"]');
    
    if (datafields.length === 0) {
      throw new Error('No AVA fields found in response');
    }

    datafields.forEach(datafield => {
      const ava = this.parseAvaField(datafield);
      avaFields.push(ava);
    });

    return avaFields;
  }

  /**
   * Parse a single AVA datafield
   * @param {Element} datafield - The AVA datafield element
   * @returns {Object} - Parsed AVA data with keys: mmsId, itemId, institution, locationCode, 
   *                      locationName, status, totalItems, onLoan, simplifiedLocation, 
   *                      holdingCount, priority, library, notes
   */
  static parseAvaField(datafield) {
    const ava = {};
    
    datafield.querySelectorAll('subfield').forEach(subfield => {
      const code = subfield.getAttribute('code');
      const value = subfield.textContent.trim();
      
      switch (code) {
        case '0':
          ava.mmsId = value;
          break;
        case '8':
          ava.itemId = value;
          break;
        case 'a':
          ava.institution = value;
          break;
        case 'b':
          ava.locationCode = value;
          break;
        case 'c':
          ava.locationName = value;
          break;
        case 'e':
          ava.status = value;
          break;
        case 'f':
          ava.totalItems = parseInt(value, 10) || 0;
          break;
        case 'g':
          ava.onLoan = parseInt(value, 10) || 0;
          break;
        case 'j':
          ava.simplifiedLocation = value;
          break;
        case 'k':
          ava.holdingCount = parseInt(value, 10) || 0;
          break;
        case 'p':
          ava.priority = parseInt(value, 10) || 0;
          break;
        case 'q':
          ava.library = value;
          break;
        case 'v':
          ava.notes = value;
          break;
      }
    });

    return ava;
  }

  /**
   * Filter AVA fields by location code
   * @param {Array<Object>} avaFields - Array of AVA field data
   * @param {string} locationCode - Location code to filter by (matches simplifiedLocation or locationCode)
   * @returns {Array<Object>} - Filtered AVA fields
   */
  static filterByLocation(avaFields, locationCode) {
    return avaFields.filter(ava => 
      ava.simplifiedLocation === locationCode || ava.locationCode === locationCode
    );
  }

  /**
   * Calculate availability summary for filtered AVA fields
   * @param {Array<Object>} avaFields - Filtered AVA field data
   * @returns {Object} - Summary with: availableCount, unavailableCount, totalCount, 
   *                      locationName, status, onLoan, hasData
   */
  static calculateSummary(avaFields) {
    if (avaFields.length === 0) {
      return {
        availableCount: 0,
        unavailableCount: 0,
        totalCount: 0,
        locationName: null,
        status: 'not_found',
        onLoan: 0,
        hasData: false
      };
    }

    // Use first field for location name
    const firstField = avaFields[0];
    
    // Calculate: available = totalItems - onLoan (for each location)
    // Sum across all records for this location
    let totalAvailableCount = 0;
    let totalItemCount = 0;
    
    avaFields.forEach(ava => {
      const available = (ava.totalItems || 0) - (ava.onLoan || 0);
      totalAvailableCount += Math.max(0, available);
      totalItemCount += (ava.totalItems || 0);
    });

    return {
      availableCount: totalAvailableCount,
      totalCount: totalItemCount,
      locationName: firstField.locationName || firstField.simplifiedLocation,
      status: totalAvailableCount > 0 ? 'available' : 'unavailable',
      hasData: true
    };
  }
}

/**
 * Alma Availability Custom Element
 * 
 * Usage:
 * <alma-availability 
 *   base-url="https://api.example.com"
 *   institution-code="LIBCODE"
 *   mms-id="123456789"
 *   location-code="circtech">
 * </alma-availability>
 * 
 * CSS Custom Properties (for styling):
 * --alma-text-color: Text color (default: #333)
 * --alma-bg-color: Background color (default: #f9f9f9)
 * --alma-border-color: Border color (default: #ddd)
 * --alma-available-color: Available status color (default: #28a745)
 * --alma-unavailable-color: Unavailable status color (default: #dc3545)
 * --alma-error-color: Error text color (default: #721c24)
 * --alma-error-bg: Error background color (default: #f8d7da)
 */
class AlmaAvailability extends HTMLElement {
  constructor() {
    super();
    this.attachShadow({ mode: 'open' });
    this.state = {
      loading: false,
      error: null,
      data: null
    };
  }

  connectedCallback() {
    this.render();
    this.fetch();
  }

  /**
   * Fetch availability data from Alma SRU
   */
  async fetch() {
    this.state.loading = true;
    this.state.error = null;
    this.render();

    try {
      // Get attributes
      const baseUrl = this.getAttribute('base-url');
      const institutionCode = this.getAttribute('institution-code');
      const mmsId = this.getAttribute('mms-id');
      const locationCode = this.getAttribute('location-code');

      // Validate required attributes
      if (!baseUrl) throw new Error('Missing required attribute: base-url');
      if (!institutionCode) throw new Error('Missing required attribute: institution-code');
      if (!mmsId) throw new Error('Missing required attribute: mms-id');
      if (!locationCode) throw new Error('Missing required attribute: location-code');

      // Build and execute query
      const url = SruClient.buildQueryUrl(baseUrl, institutionCode, mmsId);
      const xmlDoc = await SruClient.fetchXml(url);

      // Parse response
      const avaFields = MarcxmlParser.extractAvaFields(xmlDoc);
      const filtered = MarcxmlParser.filterByLocation(avaFields, locationCode);
      const summary = MarcxmlParser.calculateSummary(filtered);

      this.state.data = summary;
      this.state.loading = false;
    } catch (error) {
      this.state.error = error.message;
      this.state.loading = false;
    }

    this.render();
  }

  /**
   * Render component
   */
  render() {
    const styles = this.getStyles();
    
    let content = '';
    if (this.state.loading) {
      content = `<div class="loading">Loading...</div>`;
    } else if (this.state.error) {
      content = `<div class="error">${this.escapeHtml(this.state.error)}</div>`;
    } else if (this.state.data) {
      content = this.renderData(this.state.data);
    }

    this.shadowRoot.innerHTML = `
      <style>${styles}</style>
      <div class="container">
        ${content}
      </div>
    `;
  }

  /**
   * Render availability data
   */
  renderData(data) {
    if (!data.hasData) {
      return `<div class="no-data">Location not found</div>`;
    }

    const availabilityClass = data.status === 'available' ? 'available' : 'unavailable';
 

    return `
      <div class="availability ${availabilityClass}">
        <div class="location">${this.escapeHtml(data.locationName)}</div>
        <div class="status">
          <span class="available-count">${data.availableCount}</span>
          <span class="separator">/</span>
          <span class="total-count">${data.totalCount}</span>
        </div>
        <div class="status-text">${data.status === 'available' ? 'Available' : 'Unavailable'}</div>
      </div>
    `;
  }

  /**
   * Get component styles
   */
  getStyles() {
    // Read inherited CSS custom properties from parent
    const computedStyle = getComputedStyle(this);
    const textColor = computedStyle.getPropertyValue('--alma-text-color').trim() || '#333';
    const bgColor = computedStyle.getPropertyValue('--alma-bg-color').trim() || '#f9f9f9';
    const borderColor = computedStyle.getPropertyValue('--alma-border-color').trim() || '#ddd';
    const availableColor = computedStyle.getPropertyValue('--alma-available-color').trim() || '#28a745';
    const unavailableColor = computedStyle.getPropertyValue('--alma-unavailable-color').trim() || '#dc3545';
    const errorColor = computedStyle.getPropertyValue('--alma-error-color').trim() || '#721c24';
    const errorBg = computedStyle.getPropertyValue('--alma-error-bg').trim() || '#f8d7da';

    return `
      :host {
        --alma-text-color: ${textColor};
        --alma-bg-color: ${bgColor};
        --alma-border-color: ${borderColor};
        --alma-available-color: ${availableColor};
        --alma-unavailable-color: ${unavailableColor};
        --alma-error-color: ${errorColor};
        --alma-error-bg: ${errorBg};
      }

      .container {
        font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif;
        color: var(--alma-text-color);
      }

      .loading, .error, .no-data {
        padding: 12px 16px;
        border-radius: 4px;
        font-size: 14px;
      }

      .loading {
        background-color: var(--alma-bg-color);
        border: 1px solid var(--alma-border-color);
      }

      .error {
        background-color: var(--alma-error-bg);
        color: var(--alma-error-color);
        border: 1px solid var(--alma-error-color);
      }

      .no-data {
        background-color: var(--alma-bg-color);
        border: 1px solid var(--alma-border-color);
        text-align: center;
      }

      .availability {
        padding: 12px 16px;
        border-radius: 4px;
        border: 1px solid var(--alma-border-color);
        background-color: var(--alma-bg-color);
      }

      .availability.available {
        background-color: var(--alma-bg-color);
      }

      .availability.unavailable {
        background-color: var(--alma-bg-color);
      }

      .location {
        font-weight: 600;
        font-size: 14px;
        margin-bottom: 8px;
      }

      .status {
        display: flex;
        align-items: center;
        gap: 4px;
        font-size: 18px;
        font-weight: 600;
        margin-bottom: 6px;
      }

      .available-count {
        color: var(--alma-available-color);
      }

      .total-count {
        color: var(--alma-text-color);
      }

      .separator {
        color: var(--alma-text-color);
        margin: 0 2px;
      }

      .label {
        font-size: 12px;
        color: var(--alma-text-color);
        font-weight: normal;
      }

      .status-text {
        font-size: 13px;
        font-weight: 500;
      }

      .availability.available .status-text {
        color: var(--alma-available-color);
      }

      .availability.unavailable .status-text {
        color: var(--alma-unavailable-color);
      }
    `;
  }

  /**
   * Escape HTML to prevent XSS
   */
  escapeHtml(text) {
    const div = document.createElement('div');
    div.textContent = text;
    return div.innerHTML;
  }
}

// Register custom element
customElements.define('alma-availability', AlmaAvailability);

// Export for module usage if needed
export { AlmaAvailability, SruClient, MarcxmlParser };
