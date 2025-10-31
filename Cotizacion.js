const items = [];

const COMPANY_LOGO = 'Recurso 43.png';

// Símbolos de moneda
const currencySymbols = {
  'PEN': 'S/',
  'USD': '$',
  'EUR': '€'
};

// Helper para formatear dinero
function formatMoney(v, curr = 'PEN') {
  const symbol = currencySymbols[curr] || 'S/';
  return `${symbol} ${Number(v).toLocaleString('es-PE', { minimumFractionDigits: 2, maximumFractionDigits: 2 })}`;
}

function escapeHtml(str) {
  return String(str)
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;');
}

// Obtener moneda seleccionada
function getCurrency() {
  return document.getElementById('currency').value;
}

// Renderizar tabla de items
function renderItemsTable() {
  const itemsBody = document.getElementById('items_body');
  itemsBody.innerHTML = '';
  
  items.forEach((it, idx) => {
    const tr = document.createElement('tr');
    tr.className = 'fade-in';
    const subtotal = (it.qty || 0) * (it.price || 0);
    tr.innerHTML = `
      <td><input data-idx="${idx}" data-field="desc" value="${escapeHtml(it.desc || '')}" style="width:100%;border:0;outline:0;background:transparent;font-size:13px"/></td>
      <td><input data-idx="${idx}" data-field="qty" type="number" min="0" value="${it.qty || 1}" style="width:100%;border:0;outline:0;background:transparent;font-size:13px"/></td>
      <td><input data-idx="${idx}" data-field="price" type="number" min="0" step="0.01" value="${it.price || 0}" style="width:100%;border:0;outline:0;background:transparent;font-size:13px"/></td>
      <td style="text-align:right;font-size:13px" class="subtotal-cell">${formatMoney(subtotal, getCurrency())}</td>
      <td class="item-actions">
        <button class="btn ghost small" data-action="duplicate" data-idx="${idx}" title="Duplicar">📋</button>
        <button class="btn ghost small danger" data-action="remove" data-idx="${idx}" title="Eliminar">✕</button>
      </td>
    `;
    itemsBody.appendChild(tr);
  });
  
  updateTotalsPreview();
  
  const autoUpdate = document.getElementById('auto_update');
  if (autoUpdate && autoUpdate.checked) {
    generatePreview();
  }
}

// Calcular totales
function calculateTotals() {
  const subtotal = items.reduce((s, it) => s + (Number(it.qty || 0) * Number(it.price || 0)), 0);
  const discountType = document.getElementById('discount_type').value;
  const discountValue = Number(document.getElementById('discount').value) || 0;

  let discount = 0;
  if (discountType === 'amount') {
    discount = discountValue;
  } else {
    discount = subtotal * (discountValue / 100);
  }

  const taxPct = Number(document.getElementById('tax_pct').value) || 0;
  const taxed = Math.max(0, subtotal - discount);
  const taxAmount = taxed * (taxPct / 100);
  const total = taxed + taxAmount;

  return { subtotal, discount, discountValue, discountType, taxPct, taxAmount, total };
}

// Actualizar preview de totales
function updateTotalsPreview() {
  const totals = calculateTotals();
  const curr = getCurrency();
  const discountLabel = totals.discountType === 'percent' ?
    `Descuento (${totals.discountValue}%)` : 'Descuento';

  const totalsPreviewEl = document.getElementById('totals_preview');
  totalsPreviewEl.innerHTML = `
    <div class="totals-preview-row">
      <span>Subtotal:</span>
      <span class="currency-symbol">${formatMoney(totals.subtotal, curr)}</span>
    </div>
    <div class="totals-preview-row">
      <span>${discountLabel}:</span>
      <span class="currency-symbol">-${formatMoney(totals.discount, curr)}</span>
    </div>
    <div class="totals-preview-row">
      <span>IGV (${totals.taxPct}%):</span>
      <span class="currency-symbol">${formatMoney(totals.taxAmount, curr)}</span>
    </div>
    <div class="totals-preview-row total">
      <span>Total:</span>
      <span class="currency-symbol">${formatMoney(totals.total, curr)}</span>
    </div>
  `;
}

// Generar preview
function generatePreview() {
  const companyName = document.getElementById('company_name').value;
  const companyAddress = document.getElementById('company_address').value;
  const companyPhone = document.getElementById('company_phone').value;
  const companyEmail = document.getElementById('company_email').value; 
  const quoteNumber = document.getElementById('quote_number').value;
  const quoteDate = document.getElementById('quote_date').value || new Date().toISOString().slice(0, 10);
  const clientName = document.getElementById('client_name').value;
  const clientRuc = document.getElementById('client_ruc').value;
  const clientAddress = document.getElementById('client_address').value;
  const validityDays = document.getElementById('validity_days').value || 30;
  const terms = document.getElementById('terms').value;
  const paymentAccounts = document.getElementById('payment_accounts').value;
  const curr = getCurrency();

  const totals = calculateTotals();

  let itemsHtml = '';
  items.forEach((it) => {
    const lineSubtotal = (Number(it.qty || 0) * Number(it.price || 0));
    itemsHtml += `
      <tr>
        <td>${escapeHtml(it.desc || '')}</td>
        <td style="text-align:right">${it.qty || 0}</td>
        <td style="text-align:right">${formatMoney(it.price || 0, curr)}</td>
        <td style="text-align:right">${formatMoney(lineSubtotal, curr)}</td>
      </tr>
    `;
  });

  if (items.length === 0) {
    itemsHtml = '<tr><td colspan="4" style="text-align:center;color:#999;padding:24px">No hay items agregados</td></tr>';
  }

  const discountLabel = totals.discountType === 'percent' ?
    `Descuento (${totals.discountValue}%)` : 'Descuento';

  const previewEl = document.getElementById('preview');
  previewEl.innerHTML = `
    <div class="header">
      <div class="brand">
        <img src="${COMPANY_LOGO}" alt="Logo Empresa" style="height:64px;width:auto;border-radius:6px;object-fit:contain"/>
        <div>
          <div class="company">${escapeHtml(companyName)}</div>
          <div class="muted">${escapeHtml(companyAddress)}</div>
          <div class="muted">${escapeHtml(companyPhone)}</div>
          <div class="muted">${escapeHtml(companyEmail)}</div>
        </div>
      </div>
      <div class="meta">
        <div style="font-size:16px;font-weight:700;margin-bottom:4px">COTIZACIÓN</div>
        <div>N°: <strong>${escapeHtml(quoteNumber)}</strong></div>
        <div>Fecha: ${escapeHtml(quoteDate)}</div>
      </div>
    </div>

    <div class="bill-to">
      <strong style="font-size:14px">CLIENTE:</strong>
      <div style="margin-top:6px;font-size:15px;font-weight:600">${escapeHtml(clientName)}</div>
      <div class="muted">RUC: ${escapeHtml(clientRuc)}</div>
      <div class="muted">${escapeHtml(clientAddress)}</div>
    </div>

    <table class="items">
      <thead>
        <tr>
          <th>Descripción</th>
          <th style="width:100px;text-align:right">Cantidad</th>
          <th style="width:140px;text-align:right">Precio Unit.</th>
          <th style="width:160px;text-align:right">Subtotal</th>
        </tr>
      </thead>
      <tbody>${itemsHtml}</tbody>
    </table>

    <div class="totals">
      <table>
        <tr>
          <td style="color:#666">Subtotal</td>
          <td style="text-align:right">${formatMoney(totals.subtotal, curr)}</td>
        </tr>
        <tr>
          <td style="color:#666">${discountLabel}</td>
          <td style="text-align:right;color:#ef4444">-${formatMoney(totals.discount, curr)}</td>
        </tr>
        <tr>
          <td style="color:#666">IGV (${totals.taxPct}%)</td>
          <td style="text-align:right">${formatMoney(totals.taxAmount, curr)}</td>
        </tr>
        <tr>
          <td><strong>TOTAL</strong></td>
          <td style="text-align:right"><strong>${formatMoney(totals.total, curr)}</strong></td>
        </tr>
      </table>
    </div>

    <div class="notes">
      <div style="font-weight:600;margin-bottom:8px">TÉRMINOS Y CONDICIONES:</div>
      <div style="white-space:pre-wrap">${escapeHtml(terms)}</div>
      <div style="margin-top:12px;padding-top:12px;border-top:1px solid #e5e7eb">
        <strong>Validez de la oferta:</strong> ${validityDays} días desde la fecha de emisión.
      </div>
      <div style="margin-top:20px;padding-top:12px;border-top:1px solid #e5e7eb">
        <strong>Cuentas para pagos:</strong>
        <div style="white-space:pre-wrap">${escapeHtml(paymentAccounts)}</div>
      </div>
    </div>
  `;
}

// Inicializar cuando el DOM esté listo
document.addEventListener('DOMContentLoaded', function() {
  const itemsBody = document.getElementById('items_body');
  
  document.getElementById('quote_date').value = new Date().toISOString().slice(0, 10);
  
  itemsBody.addEventListener('input', function(e) {
    const el = e.target;
    const idx = el.dataset.idx;
    const field = el.dataset.field;
    if (idx == null) return;
    
    const val = field === 'desc' ? el.value : Number(el.value);
    items[idx][field] = val;
    
    const row = el.closest('tr');
    const subtotalCell = row.querySelector('.subtotal-cell');
    const item = items[idx];
    const subtotal = (item.qty || 0) * (item.price || 0);
    subtotalCell.textContent = formatMoney(subtotal, getCurrency());
    
    updateTotalsPreview();
    if (document.getElementById('auto_update').checked) {
      generatePreview();
    }
  });
  
  itemsBody.addEventListener('click', function(e) {
    const btn = e.target.closest('button');
    if (!btn) return;
    const action = btn.dataset.action;
    const idx = Number(btn.dataset.idx);

    if (action === 'remove') {
      items.splice(idx, 1);
      renderItemsTable();
    } else if (action === 'duplicate') {
      const item = { ...items[idx] };
      items.splice(idx + 1, 0, item);
      renderItemsTable();
    }
  });
  
  document.getElementById('add_item').addEventListener('click', function() {
    items.push({ desc: 'Nuevo producto/servicio', qty: 1, price: 0 });
    renderItemsTable();
  });

  document.getElementById('clear_items').addEventListener('click', function() {
    if (confirm('¿Eliminar todos los items?')) {
      items.length = 0;
      renderItemsTable();
    }
  });

  [
    'company_name', 'company_address', 'company_phone', 'company_email',
    'quote_number', 'quote_date', 'client_name', 'client_ruc', 'client_address',
    'tax_pct', 'discount', 'discount_type', 'currency', 'validity_days',
    'terms', 'payment_accounts'
  ].forEach(function(id) {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', function() {
        updateTotalsPreview();
        if (document.getElementById('auto_update').checked) {
          generatePreview();
        }
      });
    }
  });

  document.getElementById('preview_btn').addEventListener('click', generatePreview);
  
  document.getElementById('print_btn').addEventListener('click', function() {
    generatePreview();
    setTimeout(() => window.print(), 300);
  });

  document.getElementById('export_btn').addEventListener('click', function() {
    const data = {
      company: {
        name: document.getElementById('company_name').value,
        address: document.getElementById('company_address').value,
        phone: document.getElementById('company_phone').value,
        email: document.getElementById('company_email').value
      },
      client: {
        name: document.getElementById('client_name').value,
        ruc: document.getElementById('client_ruc').value,
        address: document.getElementById('client_address').value
      },
      quote: {
        number: document.getElementById('quote_number').value,
        date: document.getElementById('quote_date').value,
        currency: getCurrency(),
        validityDays: document.getElementById('validity_days').value
      },
      items: items,
      totals: calculateTotals(),
      terms: document.getElementById('terms').value,
      paymentAccounts: document.getElementById('payment_accounts').value
    };

    const text = JSON.stringify(data, null, 2);
    navigator.clipboard.writeText(text)
      .then(() => alert(' Datos copiados al portapapeles'))
      .catch(() => alert(' No se pudo copiar. Datos:\n\n' + text));
  });

  document.getElementById('reset_btn').addEventListener('click', function() {
    if (confirm(' ¿Restablecer todos los campos?')) {
      items.length = 0;
      location.reload();
    }
  });

  updateTotalsPreview();
  renderItemsTable();
});
