// ========== CONFIGURACIÓN ==========
const items = [];
const LOGO_PATH = 'Recurso 43.png';
const QUOTE_START_NUMBER = 3000;

const currencySymbols = {
  'USD': '$',
  'PEN': 'S/',
  'EUR': '€'
};

// ========== SISTEMA DE NUMERACIÓN ==========
function getNextQuoteNumber() {
  let currentNumber = localStorage.getItem('lastQuoteNumber');
  if (!currentNumber) {
    currentNumber = QUOTE_START_NUMBER;
  } else {
    currentNumber = parseInt(currentNumber);
  }
  return currentNumber;
}

function incrementQuoteNumber() {
  let currentNumber = getNextQuoteNumber();
  let nextNumber = currentNumber + 1;
  localStorage.setItem('lastQuoteNumber', nextNumber);
  return currentNumber;
}

function initializeQuoteNumber() {
  const quoteNumber = getNextQuoteNumber();
  document.getElementById('quote_number').value = quoteNumber;
}

// ========== FUNCIONES AUXILIARES ==========
function formatMoney(v, curr = 'USD') {
  const symbol = currencySymbols[curr] || '$';
  return `${symbol} ${Number(v).toLocaleString('es-PE', { 
    minimumFractionDigits: 2, 
    maximumFractionDigits: 2 
  })}`.replace(/,/g, ' ');
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;');
}

function getCurrency() {
  return document.getElementById('currency').value;
}

// ========== TABLA DE ITEMS ==========
function renderItemsTable() {
  const itemsBody = document.getElementById('items_body');
  itemsBody.innerHTML = '';
  
  items.forEach((it, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'fade-in';
    const total = (it.qty || 0) * (it.price || 0);
    
    tr.innerHTML = `
      <td>
        <input 
          data-idx="${idx}" 
          data-field="desc" 
          value="${escapeHtml(it.desc || '')}" 
          style="width:100%;border:0;background:transparent;font-size:13px"
        />
      </td>
      <td>
        <input 
          data-idx="${idx}" 
          data-field="qty" 
          type="number" 
          min="0" 
          value="${it.qty || 1}" 
          style="width:100%;border:0;background:transparent;font-size:13px"
        />
      </td>
      <td>
        <input 
          data-idx="${idx}" 
          data-field="price" 
          type="number" 
          min="0" 
          step="0.01" 
          value="${it.price || 0}" 
          style="width:100%;border:0;background:transparent;font-size:13px"
        />
      </td>
      <td style="text-align:right;font-size:13px;font-weight:600" class="total-cell">
        ${formatMoney(total, getCurrency())}
      </td>
      <td style="text-align:center">
        <button 
          class="btn ghost small" 
          data-action="remove" 
          data-idx="${idx}" 
          style="padding:4px 8px"
        >
          ✕
        </button>
      </td>
    `;
    
    itemsBody.appendChild(tr);
  });
  
  updateTotalsPreview();
  
  if (document.getElementById('auto_update').checked) {
    generatePreview();
  }
}

// ========== CÁLCULOS ==========
function calculateTotals() {
  const subtotal = items.reduce((s, it) => {
    return s + (Number(it.qty || 0) * Number(it.price || 0));
  }, 0);
  
  const igv = subtotal * 0.18;
  const total = subtotal + igv;
  
  return { subtotal, igv, total };
}

function updateTotalsPreview() {
  const totals = calculateTotals();
  const curr = getCurrency();
  
  document.getElementById('totals_preview').innerHTML = `
    <div class="totals-preview-row">
      <span>Subtotal:</span>
      <span>${formatMoney(totals.subtotal, curr)}</span>
    </div>
    <div class="totals-preview-row">
      <span>IGV (18%):</span>
      <span>${formatMoney(totals.igv, curr)}</span>
    </div>
    <div class="totals-preview-row total">
      <span>TOTAL:</span>
      <span>${formatMoney(totals.total, curr)}</span>
    </div>
  `;
}

// ========== GENERAR PREVIEW ==========
function generatePreview() {
  const companyName = document.getElementById('company_name').value;
  const companyRuc = document.getElementById('company_ruc').value;
  const companyEmail = document.getElementById('company_email').value;
  const quoteNumber = document.getElementById('quote_number').value;
  const quoteDate = document.getElementById('quote_date').value || new Date().toISOString().slice(0, 10);
  const clientName = document.getElementById('client_name').value;
  const clientRuc = document.getElementById('client_ruc').value;
  const clientAddress = document.getElementById('client_address').value;
  const validityDays = document.getElementById('validity_days').value || 30;
  const commercialNotes = document.getElementById('commercial_notes').value;
  const curr = getCurrency();
  const totals = calculateTotals();

  const dateObj = new Date(quoteDate + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('es-PE', { 
    year: 'numeric',
    month: '2-digit',
    day: '2-digit'
  });

  let itemsHtml = '';
  items.forEach((it) => {
    const lineTotal = (Number(it.qty || 0) * Number(it.price || 0));
    itemsHtml += `
      <tr>
        <td>${escapeHtml(it.desc || '')}</td>
        <td style="text-align:center">${it.qty || 0}</td>
        <td style="text-align:right">${formatMoney(it.price || 0, curr)}</td>
        <td style="text-align:right;font-weight:600">${formatMoney(lineTotal, curr)}</td>
      </tr>
    `;
  });

  if (items.length === 0) {
    itemsHtml = '<tr><td colspan="4" style="text-align:center;color:#999;padding:30px">No hay items agregados</td></tr>';
  }

  document.getElementById('preview').innerHTML = `
    <!-- Header con Logo y Cotización -->
    <div class="quote-header">
      <div class="logo-section">
        <img src="${LOGO_PATH}" alt="NOVOTRACE" />
      </div>
      <div class="quote-info">
        <div class="quote-title">COTIZACIÓN</div>
        <div class="quote-number">N° ${quoteNumber}</div>
        <div class="quote-date">Fecha: ${formattedDate}</div>
      </div>
    </div>

    <!-- Información de la Empresa -->
    <div class="company-info-box">
      <h4>Información de la Empresa</h4>
      <p><strong>${escapeHtml(companyName)}</strong></p>
      <p>RUC: ${escapeHtml(companyRuc)}</p>
      <p>Av. Pacto Andino S/N - LIMA</p>
      <p>Email: ${escapeHtml(companyEmail)}</p>
      <p>Teléfono: 992198342</p>
    </div>

    <!-- Información del Cliente -->
    <div class="meta-info">
      <div class="meta-box">
        <h3>CLIENTE</h3>
        <p><strong>${escapeHtml(clientName)}</strong></p>
        ${clientRuc ? `<p>RUC: ${escapeHtml(clientRuc)}</p>` : ''}
        ${clientAddress ? `<p>${escapeHtml(clientAddress)}</p>` : ''}
      </div>
    </div>

    <!-- Tabla de Productos -->
    <div class="items-section">
      <table class="items">
        <thead>
          <tr>
            <th>Descripción</th>
            <th style="width:100px;text-align:center">Cantidad</th>
            <th style="width:130px;text-align:right">Precio Unit.</th>
            <th style="width:130px;text-align:right">Subtotal</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      
      <!-- Totales -->
      <div class="totals-box">
        <div class="total-row">
          <span>Subtotal</span>
          <span>${formatMoney(totals.subtotal, curr)}</span>
        </div>
        <div class="total-row">
          <span>Descuento</span>
          <span style="color:#dc3545">-${currencySymbols[curr] || '$'} 0.00</span>
        </div>
        <div class="total-row">
          <span>IGV (18%)</span>
          <span>${formatMoney(totals.igv, curr)}</span>
        </div>
        <div class="total-row final">
          <span>TOTAL</span>
          <span>${formatMoney(totals.total, curr)}</span>
        </div>
      </div>
    </div>

    ${commercialNotes ? `
    <div class="notes-section">
      <h3>TÉRMINOS Y CONDICIONES:</h3>
      ${commercialNotes.split('\n').map(line => line.trim() ? `<p>• ${escapeHtml(line)}</p>` : '').join('')}
      <p style="margin-top:12px"><strong>Validez de la oferta:</strong> ${validityDays} días desde la fecha de emisión.</p>
    </div>` : `
    <div class="notes-section">
      <h3>TÉRMINOS Y CONDICIONES:</h3>
      <p>• Tiempo de entrega: inmediato sujeto a stock.</p>
      <p>• Estaremos a disposición para cualquier aclaración que sea necesaria.</p>
      <p style="margin-top:12px"><strong>Validez de la oferta:</strong> ${validityDays} días desde la fecha de emisión.</p>
    </div>`}

    <!-- Medios de Pago -->
    <div class="payment-display">
      <h3>Cuentas para pagos:</h3>
      <table class="payment-table">
        <thead>
          <tr>
            <th style="width:100px">BANCO</th>
            <th>DATOS DE CUENTA</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="bank-logo">
              <img src="BCP.png" alt="BCP" />
            </td>
            <td class="account-data">
              <div><strong>Cta. Soles:</strong> 194-91893576-0-91</div>
              <div><strong>Cta. Dólares:</strong> 194-91893582-0-91</div>
            </td>
          </tr>
          <tr>
            <td class="bank-logo">
              <img src="BBVA.png" alt="BBVA" />
            </td>
            <td class="account-data">
              <div><strong>Cuenta:</strong> 0011-0323-0200559998-36</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

  `;
}

// ========== NUEVA COTIZACIÓN ==========
function newQuote() {
  incrementQuoteNumber();
  items.length = 0;
  initializeQuoteNumber();
  document.getElementById('quote_date').value = new Date().toISOString().slice(0, 10);
  document.getElementById('client_name').value = '';
  document.getElementById('client_ruc').value = '';
  document.getElementById('client_address').value = '';
  document.getElementById('commercial_notes').value = '';
  renderItemsTable();
  document.getElementById('preview').innerHTML = `
    <div style="text-align:center;color:#999;padding:100px 20px">
      <div style="font-size:48px;margin-bottom:15px">📄</div>
      <div style="font-size:16px">Presiona "Generar Vista" para ver la cotización</div>
    </div>
  `;
}

// ========== EVENTOS ==========
document.addEventListener('DOMContentLoaded', function() {
  const itemsBody = document.getElementById('items_body');
  
  initializeQuoteNumber();
  document.getElementById('quote_date').value = new Date().toISOString().slice(0, 10);
  
  document.getElementById('quote_number').addEventListener('input', function(e) {
    const newNumber = parseInt(e.target.value) || QUOTE_START_NUMBER;
    localStorage.setItem('lastQuoteNumber', newNumber);
  });
  
  itemsBody.addEventListener('input', function(e) {
    const el = e.target;
    const idx = el.dataset.idx;
    const field = el.dataset.field;
    
    if (idx == null) return;
    
    items[idx][field] = field === 'desc' ? el.value : Number(el.value);
    
    const row = el.closest('tr');
    const totalCell = row.querySelector('.total-cell');
    const item = items[idx];
    totalCell.textContent = formatMoney((item.qty || 0) * (item.price || 0), getCurrency());
    
    updateTotalsPreview();
    
    if (document.getElementById('auto_update').checked) {
      generatePreview();
    }
  });
  
  itemsBody.addEventListener('click', function(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    
    const idx = Number(btn.dataset.idx);
    
    if (btn.dataset.action === 'remove') {
      items.splice(idx, 1);
      renderItemsTable();
    }
  });
  
  document.getElementById('add_item').addEventListener('click', () => {
    items.push({ 
      desc: 'Nuevo producto/servicio', 
      qty: 1, 
      price: 0 
    });
    renderItemsTable();
  });

  document.getElementById('clear_items').addEventListener('click', () => {
    if (confirm('¿Eliminar todos los items?')) {
      items.length = 0;
      renderItemsTable();
    }
  });

  const fieldsToWatch = [
    'company_name', 'company_email',
    'quote_number', 'quote_date', 'client_name', 'client_ruc', 'client_address',
    'currency', 'validity_days', 'commercial_notes'
  ];
  
  fieldsToWatch.forEach(id => {
    const element = document.getElementById(id);
    if (element) {
      element.addEventListener('input', () => {
        updateTotalsPreview();
        if (document.getElementById('auto_update').checked) {
          generatePreview();
        }
      });
    }
  });

  document.getElementById('preview_btn').addEventListener('click', generatePreview);
  
  document.getElementById('print_btn').addEventListener('click', () => {
    generatePreview();
    setTimeout(() => window.print(), 300);
  });

  document.getElementById('new_quote_btn').addEventListener('click', () => {
    if (confirm('¿Crear una nueva cotización? Se guardará el número actual y se generará uno nuevo.')) {
      newQuote();
    }
  });

  updateTotalsPreview();
  renderItemsTable();
});