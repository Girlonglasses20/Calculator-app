const historyEl = document.getElementById('history');
const displayEl = document.getElementById('current');

let state = {
  current: '0',
  previous: null,
  operator: null,
  overwrite: true
};

function updateDisplay() {
  displayEl.textContent = formatNumber(state.current);
  historyEl.textContent = state.previous !== null && state.operator
    ? `${formatNumber(state.previous)} ${state.operator}`
    : '';
}

function formatNumber(value) {
  const num = parseFloat(value);
  if (isNaN(num)) return '0';
  const parts = value.toString().split('.');
  const intPart = new Intl.NumberFormat('en-US').format(parts[0]);
  return parts.length > 1 ? `${intPart}.${parts[1]}` : intPart;
}

function inputDigit(digit) {
  if (state.overwrite) {
    state.current = digit === '.' ? '0.' : digit;
    state.overwrite = false;
    return;
  }
  if (digit === '.' && state.current.includes('.')) return;
  if (state.current.replace('-', '').replace('.', '').length >= 12) return;
  state.current = state.current === '0' && digit !== '.' ? digit : state.current + digit;
}

function chooseOperator(op) {
  if (state.operator && !state.overwrite) {
    compute();
  }
  state.previous = state.current;
  state.operator = op;
  state.overwrite = true;
}

function compute() {
  const prev = parseFloat(state.previous);
  const curr = parseFloat(state.current);
  if (isNaN(prev) || isNaN(curr)) return;

  let result;
  switch (state.operator) {
    case '+': result = prev + curr; break;
    case '−': result = prev - curr; break;
    case '×': result = prev * curr; break;
    case '÷': result = curr === 0 ? NaN : prev / curr; break;
    default: return;
  }

  state.current = isNaN(result) ? 'Error' : trimFloat(result);
  state.operator = null;
  state.previous = null;
  state.overwrite = true;
}

function trimFloat(num) {
  return Math.round(num * 1e10) / 1e10 + '';
}

function clearAll() {
  state = { current: '0', previous: null, operator: null, overwrite: true };
}

function negate() {
  if (state.current === '0') return;
  state.current = state.current.startsWith('-')
    ? state.current.slice(1)
    : '-' + state.current;
}

function percent() {
  state.current = trimFloat(parseFloat(state.current) / 100);
}

document.querySelectorAll('[data-num]').forEach(btn => {
  btn.addEventListener('click', () => {
    inputDigit(btn.dataset.num);
    updateDisplay();
  });
});

document.querySelectorAll('[data-op]').forEach(btn => {
  btn.addEventListener('click', () => {
    chooseOperator(btn.dataset.op);
    updateDisplay();
  });
});

document.getElementById('equals').addEventListener('click', () => {
  compute();
  updateDisplay();
});

document.getElementById('clear').addEventListener('click', () => {
  clearAll();
  updateDisplay();
});

document.getElementById('negate').addEventListener('click', () => {
  negate();
  updateDisplay();
});

document.getElementById('percent').addEventListener('click', () => {
  percent();
  updateDisplay();
});

window.addEventListener('keydown', (e) => {
  if (e.key >= '0' && e.key <= '9') { inputDigit(e.key); updateDisplay(); }
  else if (e.key === '.') { inputDigit('.'); updateDisplay(); }
  else if (e.key === '+') { chooseOperator('+'); updateDisplay(); }
  else if (e.key === '-') { chooseOperator('−'); updateDisplay(); }
  else if (e.key === '*') { chooseOperator('×'); updateDisplay(); }
  else if (e.key === '/') { e.preventDefault(); chooseOperator('÷'); updateDisplay(); }
  else if (e.key === 'Enter' || e.key === '=') { compute(); updateDisplay(); }
  else if (e.key === 'Escape') { clearAll(); updateDisplay(); }
  else if (e.key === 'Backspace') {
    state.current = state.current.length > 1 ? state.current.slice(0, -1) : '0';
    updateDisplay();
  }
});

updateDisplay();
