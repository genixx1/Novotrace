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
  })}`;
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
  const total = items.reduce((s, it) => {
    return s + (Number(it.qty || 0) * Number(it.price || 0));
  }, 0);
  
  // Los precios ya incluyen IGV, por lo tanto:
  // Total = Subtotal + IGV
  // Total = Subtotal * 1.18
  // Subtotal = Total / 1.18
  const subtotal = total / 1.18;
  const igv = total - subtotal;
  
  return { subtotal, igv, total };
}

function updateTotalsPreview() {
  const totals = calculateTotals();
  const curr = getCurrency();
  
  document.getElementById('totals_preview').innerHTML = `
    <div class="totals-preview-row">
      <span>Subtotal (sin IGV):</span>
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
  // Obtener datos del formulario
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

  // Formatear fecha
  const dateObj = new Date(quoteDate + 'T00:00:00');
  const formattedDate = dateObj.toLocaleDateString('es-PE', { 
    day: '2-digit', 
    month: 'long', 
    year: 'numeric' 
  });

  // Generar HTML de items
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

  // Generar HTML completo del preview (SIN el número de cotización)
  document.getElementById('preview').innerHTML = `
    <div class="logo-header">
      <img src="${LOGO_PATH}" alt="NOVOTRACE" style="height: 80px; width: auto;" />
    </div>

    <div style="text-align:right;margin-bottom:20px;">
      <span style="font-size:13px">Lima, ${formattedDate}</span>
    </div>

    <div class="meta-info">
      <div class="meta-box">
        <h3>ESTIMADO(A):</h3>
        <p><strong>${escapeHtml(clientName)}</strong></p>
        ${clientRuc ? `<p>RUC: ${escapeHtml(clientRuc)}</p>` : ''}
        ${clientAddress ? `<p>${escapeHtml(clientAddress)}</p>` : ''}
      </div>
      <div class="meta-box">
        <h3>EMPRESA:</h3>
        <p><strong>${escapeHtml(companyName)}</strong></p>
        <p>RUC: ${escapeHtml(companyRuc)}</p>
        <p>Email: ${escapeHtml(companyEmail)}</p>
      </div>
    </div>

    <p style="margin:24px 0;font-size:14px;line-height:1.8">
      Cordial saludo:<br><br>
      Conforme a lo conversado, presentamos la propuesta económica detallada por equipos, instalación y servicios asociados.
    </p>

    <div class="items-section">
      <table class="items">
        <thead>
          <tr>
            <th>Productos</th>
            <th style="width:100px;text-align:center">Cantidad</th>
            <th style="width:150px;text-align:right">Precio Unit.</th>
            <th style="width:150px;text-align:right">Precio Total</th>
          </tr>
        </thead>
        <tbody>${itemsHtml}</tbody>
      </table>
      
      <div style="margin-top: 20px; text-align: right; padding-right: 12px;">
        <div style="display: inline-block; min-width: 350px;">
          <div style="display: flex; justify-content: space-between; padding: 8px 16px; border-bottom: 1px solid #e8ecf1;">
            <span style="font-weight: 600; color: #6c757d;">Subtotal (sin IGV):</span>
            <span style="font-weight: 600;">${formatMoney(totals.subtotal, curr)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 8px 16px; border-bottom: 1px solid #e8ecf1;">
            <span style="font-weight: 600; color: #6c757d;">IGV (18%):</span>
            <span style="font-weight: 600;">${formatMoney(totals.igv, curr)}</span>
          </div>
          <div style="display: flex; justify-content: space-between; padding: 12px 16px; background: linear-gradient(135deg, #fff5f2 0%, #ffe8e0 100%); border-radius: 8px; margin-top: 4px;">
            <span style="font-weight: 700; color: var(--novotrace-blue); font-size: 16px;">TOTAL:</span>
            <span style="font-weight: 700; color: var(--novotrace-orange); font-size: 16px;">${formatMoney(totals.total, curr)}</span>
          </div>
        </div>
      </div>
    </div>

    ${commercialNotes ? `
    <div class="notes-section">
      <h3>Notas Comerciales:</h3>
      ${commercialNotes.split('\n').map(line => `<p>• ${escapeHtml(line)}</p>`).join('')}
      <p style="margin-top:10px"><strong>Validez de la Oferta:</strong> ${validityDays} días</p>
    </div>` : ''}

    <div class="payment-display">
      <h3>MEDIOS DE PAGO</h3>
      <table class="payment-table">
        <thead>
          <tr>
            <th style="width:120px;">BANCO</th>
            <th>DATOS DE CUENTA</th>
          </tr>
        </thead>
        <tbody>
          <tr>
            <td class="bank-logo">
              <img src="BCP.png" alt="BCP" />
            </td>
            <td class="account-data">
              <div><strong>Cuenta Soles:</strong> 19491893576091</div>
              <div><strong>CCI Soles:</strong> 00219419189357609190</div>
              <div><strong>Cuenta Dólares:</strong> 19491893582197</div>
              <div><strong>CCI Dólares:</strong> 00219419189358219797</div>
              <div><strong>Titular:</strong> NOVOTRACE S.A.C.</div>
            </td>
          </tr>
          <tr>
            <td class="bank-logo">
              <img src="BBVA.png" alt="BBVA" />
            </td>
            <td class="account-data">
              <div><strong>Cuenta:</strong> 00110323360200559998</div>
              <div><strong>Moneda:</strong> Soles (PEN)</div>
              <div><strong>Titular:</strong> NOVOTRACE S.A.C.</div>
            </td>
          </tr>
        </tbody>
      </table>
    </div>

    <div class="footer-nt">
      <div class="footer-item">
        <span>🌐</span>
        <span>novotrace.com.pe</span>
      </div>
      <div class="footer-item">
        <span>✉️</span>
        <span>ventas@novotrace.com.pe</span>
      </div>
    </div>
  `;
}

// ========== NUEVA COTIZACIÓN ==========
function newQuote() {
  // Incrementar número de cotización
  incrementQuoteNumber();
  
  // Limpiar items
  items.length = 0;
  
  // Reinicializar número de cotización
  initializeQuoteNumber();
  
  // Restablecer fecha
  document.getElementById('quote_date').value = new Date().toISOString().slice(0, 10);
  
  // Limpiar datos del cliente
  document.getElementById('client_name').value = '';
  document.getElementById('client_ruc').value = '';
  document.getElementById('client_address').value = '';
  
  // Limpiar notas comerciales
  document.getElementById('commercial_notes').value = '';
  
  // Renderizar tabla vacía
  renderItemsTable();
  
  // Limpiar preview
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
  
  // Inicializar número de cotización
  initializeQuoteNumber();
  
  // Establecer fecha actual
  document.getElementById('quote_date').value = new Date().toISOString().slice(0, 10);
  
  // Evento para actualizar el número de cotización cuando se edita manualmente
  document.getElementById('quote_number').addEventListener('input', function(e) {
    const newNumber = parseInt(e.target.value) || QUOTE_START_NUMBER;
    localStorage.setItem('lastQuoteNumber', newNumber);
  });
  
  // Eventos de inputs en la tabla
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
  
  // Eventos de botones en la tabla
  itemsBody.addEventListener('click', function(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    
    const idx = Number(btn.dataset.idx);
    
    if (btn.dataset.action === 'remove') {
      items.splice(idx, 1);
      renderItemsTable();
    }
  });
  
  // Botón agregar item
  document.getElementById('add_item').addEventListener('click', () => {
    items.push({ 
      desc: 'Nuevo producto/servicio', 
      qty: 1, 
      price: 0 
    });
    renderItemsTable();
  });

  // Botón limpiar items
  document.getElementById('clear_items').addEventListener('click', () => {
    if (confirm('¿Eliminar todos los items?')) {
      items.length = 0;
      renderItemsTable();
    }
  });

  // Auto-actualizar cuando cambian los campos
  const fieldsToWatch = [
    'company_name', 'company_address', 'company_phone', 'company_email',
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

  // Botón generar vista
  document.getElementById('preview_btn').addEventListener('click', generatePreview);
  
  // Botón imprimir
  document.getElementById('print_btn').addEventListener('click', () => {
    generatePreview();
    setTimeout(() => window.print(), 300);
  });

  // Botón nueva cotización
  document.getElementById('new_quote_btn').addEventListener('click', () => {
    if (confirm('¿Crear una nueva cotización? Se guardará el número actual y se generará uno nuevo.')) {
      newQuote();
    }
  });

  // Inicializar
  updateTotalsPreview();
  renderItemsTable();
});