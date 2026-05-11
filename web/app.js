const els = {
  customerName: document.getElementById("customerName"),
  customerLabel: document.getElementById("customerLabel"),
  loanAmountText: document.getElementById("loanAmountText"),
  interestRateText: document.getElementById("interestRateText"),
  loanDurationText: document.getElementById("loanDurationText"),
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

function readOptionalNumber(element) {
  if (element.value.trim() === "") {
    return null;
  }

  const value = Number(element.value);
  return Number.isFinite(value) ? value : null;
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

function showEmptyState() {
  els.emiValue.textContent = "Rs --";
  els.totalPayable.textContent = "--";
  els.totalInterest.textContent = "--";
  els.tenureMonths.textContent = "--";
  els.principalLabel.textContent = "--";
  els.interestShare.textContent = "--";
  els.principalBar.style.width = "50%";
  els.interestBar.style.width = "50%";
}

function update() {
  const name = els.customerName.value.trim();
  const principal = readOptionalNumber(els.loanAmountText);
  const annualRate = readOptionalNumber(els.interestRateText);
  const years = readOptionalNumber(els.loanDurationText);

  els.customerLabel.textContent = name || "Not entered";

  if (principal === null || annualRate === null || years === null || principal <= 0 || annualRate < 0 || years <= 0) {
    showEmptyState();
    return;
  }

  const months = Math.round(years * 12);
  const emi = calculateEmi(principal, annualRate, years);
  const payable = emi * months;
  const interest = Math.max(payable - principal, 0);
  const interestPercent = payable > 0 ? Math.round((interest / payable) * 100) : 0;
  const principalPercent = Math.max(100 - interestPercent, 2);

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
  els.customerName.value = "";
  els.loanAmountText.value = "";
  els.interestRateText.value = "";
  els.loanDurationText.value = "";
  update();
}

[
  els.customerName,
  els.loanAmountText,
  els.interestRateText,
  els.loanDurationText,
].forEach((element) => {
  element.addEventListener("input", update);
});

els.resetBtn.addEventListener("click", resetCalculator);

update();
