const defaults = {
  customerName: "Aarav Kumar",
  loanAmount: 500000,
  interestRate: 8.5,
  loanDuration: 5,
};

const els = {
  customerName: document.getElementById("customerName"),
  customerLabel: document.getElementById("customerLabel"),
  loanAmount: document.getElementById("loanAmount"),
  loanAmountText: document.getElementById("loanAmountText"),
  loanAmountOutput: document.getElementById("loanAmountOutput"),
  interestRate: document.getElementById("interestRate"),
  interestRateText: document.getElementById("interestRateText"),
  interestRateOutput: document.getElementById("interestRateOutput"),
  loanDuration: document.getElementById("loanDuration"),
  loanDurationText: document.getElementById("loanDurationText"),
  loanDurationOutput: document.getElementById("loanDurationOutput"),
  emiValue: document.getElementById("emiValue"),
  totalPayable: document.getElementById("totalPayable"),
  totalInterest: document.getElementById("totalInterest"),
  tenureMonths: document.getElementById("tenureMonths"),
  principalLabel: document.getElementById("principalLabel"),
  interestShare: document.getElementById("interestShare"),
  principalBar: document.getElementById("principalBar"),
  interestBar: document.getElementById("interestBar"),
  resetBtn: document.getElementById("resetBtn"),
};

const money = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

function formatMoney(value) {
  return `Rs ${money.format(Math.round(value || 0))}`;
}

function clamp(value, min, max) {
  return Math.min(Math.max(value, min), max);
}

function readNumber(element, fallback) {
  const value = Number(element.value);
  return Number.isFinite(value) ? value : fallback;
}

function calculateEmi(principal, annualRate, years) {
  const months = Math.max(Math.round(years * 12), 1);
  const monthlyRate = annualRate / 12 / 100;

  if (monthlyRate === 0) {
    return principal / months;
  }

  const factor = (1 + monthlyRate) ** months;
  return (principal * monthlyRate * factor) / (factor - 1);
}

function syncValue(source, target, min, max) {
  const next = clamp(readNumber(source, Number(target.value)), min, max);
  source.value = next;
  target.value = next;
  update();
}

function update() {
  const principal = Math.max(readNumber(els.loanAmountText, defaults.loanAmount), 0);
  const annualRate = Math.max(readNumber(els.interestRateText, defaults.interestRate), 0);
  const years = Math.max(readNumber(els.loanDurationText, defaults.loanDuration), 1);
  const months = Math.round(years * 12);
  const emi = calculateEmi(principal, annualRate, years);
  const payable = emi * months;
  const interest = Math.max(payable - principal, 0);
  const interestPercent = payable > 0 ? Math.round((interest / payable) * 100) : 0;
  const principalPercent = Math.max(100 - interestPercent, 2);

  els.loanAmount.value = clamp(principal, Number(els.loanAmount.min), Number(els.loanAmount.max));
  els.interestRate.value = clamp(annualRate, Number(els.interestRate.min), Number(els.interestRate.max));
  els.loanDuration.value = clamp(years, Number(els.loanDuration.min), Number(els.loanDuration.max));

  els.loanAmountOutput.value = formatMoney(principal);
  els.interestRateOutput.value = `${annualRate.toFixed(1)}%`;
  els.loanDurationOutput.value = `${years} ${years === 1 ? "year" : "years"}`;

  els.customerLabel.textContent = els.customerName.value.trim() || "Customer";
  els.emiValue.textContent = formatMoney(emi);
  els.totalPayable.textContent = formatMoney(payable);
  els.totalInterest.textContent = formatMoney(interest);
  els.tenureMonths.textContent = `${months} months`;
  els.principalLabel.textContent = formatMoney(principal);
  els.interestShare.textContent = `${interestPercent}%`;
  els.principalBar.style.width = `${principalPercent}%`;
  els.interestBar.style.width = `${Math.max(interestPercent, 2)}%`;
}

function resetCalculator() {
  els.customerName.value = defaults.customerName;
  els.loanAmount.value = defaults.loanAmount;
  els.loanAmountText.value = defaults.loanAmount;
  els.interestRate.value = defaults.interestRate;
  els.interestRateText.value = defaults.interestRate;
  els.loanDuration.value = defaults.loanDuration;
  els.loanDurationText.value = defaults.loanDuration;
  update();
}

els.customerName.addEventListener("input", update);
els.loanAmount.addEventListener("input", () => syncValue(els.loanAmount, els.loanAmountText, 0, 10000000));
els.loanAmountText.addEventListener("input", () => syncValue(els.loanAmountText, els.loanAmount, 0, 10000000));
els.interestRate.addEventListener("input", () => syncValue(els.interestRate, els.interestRateText, 0, 24));
els.interestRateText.addEventListener("input", () => syncValue(els.interestRateText, els.interestRate, 0, 24));
els.loanDuration.addEventListener("input", () => syncValue(els.loanDuration, els.loanDurationText, 1, 30));
els.loanDurationText.addEventListener("input", () => syncValue(els.loanDurationText, els.loanDuration, 1, 30));
els.resetBtn.addEventListener("click", resetCalculator);

update();
