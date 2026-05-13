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
  downloadPdfBtn: document.getElementById("downloadPdfBtn"),
  downloadDocBtn: document.getElementById("downloadDocBtn"),
  resetBtn: document.getElementById("resetBtn"),
};

const money = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 0,
});

const preciseMoney = new Intl.NumberFormat("en-IN", {
  maximumFractionDigits: 2,
  minimumFractionDigits: 2,
});

const billDate = new Intl.DateTimeFormat("en-IN", {
  dateStyle: "medium",
  timeStyle: "short",
});

let currentBill = null;

function formatMoney(value) {
  return `Rs ${money.format(Math.round(value || 0))}`;
}

function formatBillMoney(value) {
  return `Rs ${preciseMoney.format(value || 0)}`;
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
  currentBill = null;
  els.emiValue.textContent = "Rs --";
  els.totalPayable.textContent = "--";
  els.totalInterest.textContent = "--";
  els.tenureMonths.textContent = "--";
  els.principalLabel.textContent = "--";
  els.interestShare.textContent = "--";
  els.principalBar.style.width = "50%";
  els.interestBar.style.width = "50%";
  updateDownloadState();
}

function updateDownloadState() {
  const isDisabled = currentBill === null;
  els.downloadPdfBtn.disabled = isDisabled;
  els.downloadDocBtn.disabled = isDisabled;
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

  currentBill = {
    customerName: name || "Customer",
    principal,
    annualRate,
    years,
    months,
    emi,
    payable,
    interest,
    interestPercent,
    generatedAt: new Date(),
  };

  els.emiValue.textContent = formatMoney(emi);
  els.totalPayable.textContent = formatMoney(payable);
  els.totalInterest.textContent = formatMoney(interest);
  els.tenureMonths.textContent = `${months} months`;
  els.principalLabel.textContent = formatMoney(principal);
  els.interestShare.textContent = `${interestPercent}%`;
  els.principalBar.style.width = `${principalPercent}%`;
  els.interestBar.style.width = `${Math.max(interestPercent, 2)}%`;
  updateDownloadState();
}

function resetCalculator() {
  els.customerName.value = "";
  els.loanAmountText.value = "";
  els.interestRateText.value = "";
  els.loanDurationText.value = "";
  update();
}

function safeFilePart(value) {
  const safeValue = value
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");

  return safeValue || "customer";
}

function billNumber(bill) {
  const stamp = bill.generatedAt.toISOString().slice(0, 10).replace(/-/g, "");
  return `EMI-${stamp}-${Math.floor(bill.generatedAt.getTime() / 1000)}`;
}

function billRows(bill) {
  return [
    ["Customer name", bill.customerName],
    ["Loan amount", formatBillMoney(bill.principal)],
    ["Interest rate", `${bill.annualRate}% p.a.`],
    ["Duration", `${bill.years} year${bill.years === 1 ? "" : "s"} (${bill.months} months)`],
    ["Monthly EMI", formatBillMoney(bill.emi)],
    ["Total interest", formatBillMoney(bill.interest)],
    ["Total payable", formatBillMoney(bill.payable)],
    ["Interest share", `${bill.interestPercent}%`],
  ];
}

function downloadBlob(blob, fileName) {
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");

  link.href = url;
  link.download = fileName;
  document.body.appendChild(link);
  link.click();
  link.remove();
  window.setTimeout(() => URL.revokeObjectURL(url), 0);
}

function billFileName(extension) {
  const date = currentBill.generatedAt.toISOString().slice(0, 10);
  return `emi-bill-${safeFilePart(currentBill.customerName)}-${date}.${extension}`;
}

function escapeHtml(value) {
  return String(value)
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&#039;");
}

function createDocBill(bill) {
  const rows = billRows(bill)
    .map(([label, value]) => `
      <tr>
        <th>${escapeHtml(label)}</th>
        <td>${escapeHtml(value)}</td>
      </tr>
    `)
    .join("");

  const html = `<!doctype html>
<html>
  <head>
    <meta charset="utf-8">
    <title>EMI Bill</title>
    <style>
      body {
        margin: 40px;
        color: #1d1d1f;
        font-family: Arial, sans-serif;
      }
      h1 {
        margin: 0 0 6px;
        font-size: 28px;
      }
      .meta {
        margin: 0 0 28px;
        color: #555;
        font-size: 13px;
      }
      table {
        width: 100%;
        border-collapse: collapse;
      }
      th,
      td {
        border: 1px solid #d9dde5;
        padding: 12px 14px;
        text-align: left;
      }
      th {
        width: 42%;
        background: #f2f5f9;
      }
      .total th,
      .total td {
        background: #eaf3ff;
        font-size: 18px;
        font-weight: 700;
      }
      .note {
        margin-top: 26px;
        color: #666;
        font-size: 12px;
      }
    </style>
  </head>
  <body>
    <h1>EMI Bill</h1>
    <p class="meta">Bill no: ${escapeHtml(billNumber(bill))}<br>Generated: ${escapeHtml(billDate.format(bill.generatedAt))}</p>
    <table>
      ${rows}
      <tr class="total">
        <th>Amount due every month</th>
        <td>${escapeHtml(formatBillMoney(bill.emi))}</td>
      </tr>
    </table>
    <p class="note">This is an EMI estimate generated from the values entered in the calculator.</p>
  </body>
</html>`;

  return new Blob(["\ufeff", html], {
    type: "application/msword;charset=utf-8",
  });
}

function escapePdfText(value) {
  return String(value)
    .normalize("NFKD")
    .replace(/[^\x20-\x7e]/g, "")
    .replace(/\\/g, "\\\\")
    .replace(/\(/g, "\\(")
    .replace(/\)/g, "\\)");
}

function pdfText(value, x, y, size = 12, font = "F1") {
  return `BT /${font} ${size} Tf ${x} ${y} Td (${escapePdfText(value)}) Tj ET`;
}

function createPdfBill(bill) {
  const width = 595;
  const height = 842;
  const left = 48;
  const right = width - left;
  const content = [];
  const rows = billRows(bill);

  content.push("0.98 0.99 1 rg 0 0 595 842 re f");
  content.push("0.12 0.15 0.19 rg");
  content.push(pdfText("EMI Bill", left, 784, 28, "F2"));
  content.push(pdfText(`Bill no: ${billNumber(bill)}`, left, 758, 10));
  content.push(pdfText(`Generated: ${billDate.format(bill.generatedAt)}`, left, 742, 10));

  content.push("0.93 0.96 1 rg 48 660 499 54 re f");
  content.push("0.12 0.15 0.19 rg");
  content.push(pdfText("Amount due every month", 66, 694, 11));
  content.push(pdfText(formatBillMoney(bill.emi), 66, 672, 22, "F2"));

  let y = 614;
  rows.forEach(([label, value], index) => {
    if (index % 2 === 0) {
      content.push(`0.97 0.98 0.99 rg ${left} ${y - 11} ${right - left} 34 re f`);
    }

    content.push("0.82 0.85 0.9 RG 0.8 w");
    content.push(`${left} ${y - 11} ${right - left} 34 re S`);
    content.push("0.36 0.39 0.44 rg");
    content.push(pdfText(label, 64, y + 1, 10));
    content.push("0.12 0.15 0.19 rg");
    content.push(pdfText(value, 312, y + 1, 11, index >= 4 ? "F2" : "F1"));
    y -= 34;
  });

  content.push("0.36 0.39 0.44 rg");
  content.push(pdfText("This is an EMI estimate generated from the values entered in the calculator.", left, 96, 9));

  const stream = content.join("\n");
  const objects = [
    "<< /Type /Catalog /Pages 2 0 R >>",
    "<< /Type /Pages /Kids [3 0 R] /Count 1 >>",
    `<< /Type /Page /Parent 2 0 R /MediaBox [0 0 ${width} ${height}] /Resources << /Font << /F1 4 0 R /F2 5 0 R >> >> /Contents 6 0 R >>`,
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica >>",
    "<< /Type /Font /Subtype /Type1 /BaseFont /Helvetica-Bold >>",
    `<< /Length ${stream.length} >>\nstream\n${stream}\nendstream`,
  ];

  let pdf = "%PDF-1.4\n";
  const offsets = [0];

  objects.forEach((object, index) => {
    offsets.push(pdf.length);
    pdf += `${index + 1} 0 obj\n${object}\nendobj\n`;
  });

  const xrefOffset = pdf.length;
  pdf += `xref\n0 ${objects.length + 1}\n`;
  pdf += "0000000000 65535 f \n";
  offsets.slice(1).forEach((offset) => {
    pdf += `${String(offset).padStart(10, "0")} 00000 n \n`;
  });
  pdf += `trailer\n<< /Size ${objects.length + 1} /Root 1 0 R >>\nstartxref\n${xrefOffset}\n%%EOF`;

  return new Blob([pdf], {
    type: "application/pdf",
  });
}

function downloadPdfBill() {
  if (!currentBill) {
    return;
  }

  downloadBlob(createPdfBill(currentBill), billFileName("pdf"));
}

function downloadDocBill() {
  if (!currentBill) {
    return;
  }

  downloadBlob(createDocBill(currentBill), billFileName("doc"));
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
els.downloadPdfBtn.addEventListener("click", downloadPdfBill);
els.downloadDocBtn.addEventListener("click", downloadDocBill);

update();
