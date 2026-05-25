import { useState, useEffect, useRef } from "react";
import { FileText, Download, Send, Search, X, CheckCircle, Loader2 } from "lucide-react";
import { jsPDF } from "jspdf";
import { fetchAccounts } from "../../shared/api/accounts";
import type { ApiAccount } from "../../shared/api/types";

export function DemandLetterGenerator() {
  const [formData, setFormData] = useState({
    debtorName: "",
    debtorAddress: "",
    creditorReference: "",
    originalAmount: "",
    currentAmount: "",
    dueDate: "",
    letterType: "initial",
  });
  const [validationMessage, setValidationMessage] = useState<string | null>(null);
  const [templateConfig, setTemplateConfig] = useState({
    agencyName: "Top Priority Collection Agency",
    agencyAddress: "xxx,xxx, Iloilo City,5000",
    subjectTemplate: "RE: Account Number {accountNumber} - Demand for Payment",
    bodyTemplate:
      "Dear {debtorName}:\n\nThis letter serves as formal notice that you have an outstanding debt in the amount of PHP {currentAmount} related to Account Number {accountNumber}.\n\nThe original amount owed was PHP {originalAmount}. Despite our previous attempts to contact you regarding this matter, the debt remains unpaid.\n\nWe hereby demand payment in full by {dueDate}. Failure to remit payment by this date may result in additional collection actions, including but not limited to reporting to credit bureaus and potential legal proceedings.\n\nPayment can be made by:\n- Bank transfer to account details provided below\n- Check payable to TPCA\n- Online payment portal at www.TPCA.com/pay\n\nIf you wish to discuss a payment arrangement or dispute this debt, please contact our office immediately at (617) 555-0100.\n\nThis is an attempt to collect a debt. Any information obtained will be used for that purpose.\n\nSincerely,\n{closingName}\n{closingTitle}",
    closingName: "Top Priority Collection Agency",
    closingTitle: "Collections Department",
  });
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [pdfLoading, setPdfLoading] = useState(false);

  // ── Account autocomplete state ─────────────────────────────────────────────
  const [accounts, setAccounts] = useState<ApiAccount[]>([]);
  const [accountsLoading, setAccountsLoading] = useState(false);
  const [suggestions, setSuggestions] = useState<ApiAccount[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [selectedAccount, setSelectedAccount] = useState<ApiAccount | null>(null);
  const nameInputRef = useRef<HTMLInputElement>(null);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    setAccountsLoading(true);
    fetchAccounts()
      .then(setAccounts)
      .catch(() => {})
      .finally(() => setAccountsLoading(false));
  }, []);

  // Close dropdown on outside click
  useEffect(() => {
    const handler = (e: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(e.target as Node) &&
        nameInputRef.current &&
        !nameInputRef.current.contains(e.target as Node)
      ) {
        setShowSuggestions(false);
      }
    };
    document.addEventListener("mousedown", handler);
    return () => document.removeEventListener("mousedown", handler);
  }, []);

  const handleDebtorNameChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setFormData((prev) => ({ ...prev, debtorName: value }));
    setValidationMessage(null);
    setSelectedAccount(null);

    if (value.trim().length > 0) {
      const q = value.toLowerCase();
      const filtered = accounts
        .filter((a) => a.debtorName.toLowerCase().includes(q))
        .slice(0, 8);
      setSuggestions(filtered);
      setShowSuggestions(true);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  };

  const handleSelectAccount = (account: ApiAccount) => {
    setSelectedAccount(account);
    setFormData((prev) => ({
      ...prev,
      debtorName: account.debtorName,
      debtorAddress: account.debtorAddress ?? "",
      creditorReference: String(account.accountNumber),
      originalAmount: account.bill != null ? String(account.bill) : "",
      currentAmount: String(account.balance),
      // dueDate intentionally left unchanged
    }));
    setSuggestions([]);
    setShowSuggestions(false);
  };

  const clearSelection = () => {
    setSelectedAccount(null);
    setFormData((prev) => ({
      ...prev,
      debtorName: "",
      debtorAddress: "",
      creditorReference: "",
      originalAmount: "",
      currentAmount: "",
    }));
    setTimeout(() => nameInputRef.current?.focus(), 0);
  };

  const handleChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>
  ) => {
    setFormData((prev) => ({ ...prev, [e.target.name]: e.target.value }));
    setValidationMessage(null);
  };

  const handleTemplateChange = (
    e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setTemplateConfig((prev) => ({ ...prev, [e.target.name]: e.target.value }));
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const renderTemplate = (template: string) => {
    const values: Record<string, string> = {
      debtorName: formData.debtorName || "[Debtor Name]",
      debtorAddress: formData.debtorAddress || "[Debtor Address]",
      accountNumber: formData.creditorReference || "[Account Number]",
      originalAmount: formData.originalAmount || "[Original Amount]",
      currentAmount: formData.currentAmount || "[Outstanding Balance]",
      dueDate: formData.dueDate || "[Due Date]",
      closingName: templateConfig.closingName,
      closingTitle: templateConfig.closingTitle,
    };
    return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
  };

  const validateRequiredFields = () => {
    const missing: string[] = [];
    if (!formData.debtorName.trim()) missing.push("Debtor's full name");
    if (!formData.debtorAddress.trim()) missing.push("Debtor's address");
    if (!formData.currentAmount.trim()) missing.push("Outstanding balance");
    return missing;
  };

  const handleDownloadPDF = () => {
    const missing = validateRequiredFields();
    if (missing.length > 0) {
      setValidationMessage(
        `Cannot generate the demand letter. Please provide: ${missing.join(", ")}.`
      );
      return;
    }
    setValidationMessage(null);
    setPdfLoading(true);
    try {
      const pdf = new jsPDF({ orientation: "portrait", unit: "mm", format: "a4" });
      const pageWidth = pdf.internal.pageSize.getWidth();
      const pageHeight = pdf.internal.pageSize.getHeight();
      const margin = 20;
      const contentWidth = pageWidth - margin * 2;
      let y = margin;

      const addLine = (text: string, fontSize: number, style: "normal" | "bold", align: "left" | "center" | "right" = "left") => {
        pdf.setFontSize(fontSize);
        pdf.setFont("helvetica", style);
        const lines = pdf.splitTextToSize(text, contentWidth);
        for (const line of lines) {
          if (y > pageHeight - margin) { pdf.addPage(); y = margin; }
          const x = align === "center" ? pageWidth / 2 : align === "right" ? pageWidth - margin : margin;
          pdf.text(line, x, y, { align });
          y += fontSize * 0.4;
        }
      };

      // Agency header
      addLine(templateConfig.agencyName, 16, "bold", "center");
      y += 1;
      addLine(templateConfig.agencyAddress, 10, "normal", "center");
      y += 3;
      pdf.setDrawColor(0);
      pdf.setLineWidth(0.5);
      pdf.line(margin, y, pageWidth - margin, y);
      y += 8;

      // Date
      addLine(currentDate, 10, "normal", "right");
      y += 6;

      // Recipient
      addLine(formData.debtorName || "[Debtor Name]", 11, "bold");
      y += 1;
      addLine(formData.debtorAddress || "[Debtor Address]", 10, "normal");
      y += 8;

      // Subject
      addLine(renderTemplate(templateConfig.subjectTemplate), 11, "bold");
      y += 6;

      // Body
      const bodyText = renderTemplate(templateConfig.bodyTemplate);
      pdf.setFontSize(10);
      pdf.setFont("helvetica", "normal");
      const bodyLines = pdf.splitTextToSize(bodyText, contentWidth);
      for (const line of bodyLines) {
        if (y > pageHeight - margin) { pdf.addPage(); y = margin; }
        pdf.text(line, margin, y);
        y += 5;
      }

      const filename = `demand-letter-${formData.creditorReference || "draft"}.pdf`;
      pdf.save(filename);
    } catch (err) {
      console.error("PDF generation error:", err);
      setValidationMessage("Failed to generate PDF. Please try again.");
    } finally {
      setPdfLoading(false);
    }
  };

  const handleSend = () => {
    const missing = validateRequiredFields();
    if (missing.length > 0) {
      setValidationMessage(
        `Cannot send the demand letter. Please provide: ${missing.join(", ")}.`
      );
      return;
    }
    setValidationMessage(null);
    window.alert("Demand letter is ready to send.");
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Demand Letter Generator</h2>
        <p className="text-gray-500 mt-1">Create professional demand letters with live preview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* ── Form ── */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <h3 className="text-lg font-semibold text-gray-900 mb-4">Letter Details</h3>
          <form className="space-y-4">

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Letter Type</label>
              <select
                name="letterType"
                value={formData.letterType}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              >
                <option value="initial">Initial Demand</option>
                <option value="final">Final Notice</option>
                <option value="legal">Legal Action Warning</option>
                <option value="settlement">Settlement Offer</option>
              </select>
            </div>

            {/* ── Debtor Name with autocomplete ── */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Debtor Name</label>
              <div className="relative">
                <div className="relative">
                  <input
                    ref={nameInputRef}
                    type="text"
                    name="debtorName"
                    value={formData.debtorName}
                    onChange={handleDebtorNameChange}
                    onFocus={() => {
                      if (suggestions.length > 0) setShowSuggestions(true);
                    }}
                    onKeyDown={(e) => {
                      if (e.key === "Escape") setShowSuggestions(false);
                    }}
                    placeholder="Type to search debtor…"
                    autoComplete="off"
                    className="w-full px-3 py-2 pr-9 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                  <span className="absolute right-2.5 top-1/2 -translate-y-1/2 pointer-events-none">
                    {selectedAccount ? (
                      <CheckCircle className="w-4 h-4 text-green-500" />
                    ) : (
                      <Search className="w-4 h-4 text-gray-400" />
                    )}
                  </span>
                </div>

                {/* Dropdown */}
                {showSuggestions && (
                  <div
                    ref={dropdownRef}
                    className="absolute z-50 w-full mt-1 bg-white border border-gray-200 rounded-lg shadow-lg max-h-60 overflow-y-auto"
                  >
                    {accountsLoading ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        Loading accounts…
                      </div>
                    ) : suggestions.length === 0 ? (
                      <div className="px-4 py-3 text-sm text-gray-500">
                        No accounts match "{formData.debtorName}".
                      </div>
                    ) : (
                      suggestions.map((account) => (
                        <button
                          key={account.id}
                          type="button"
                          onMouseDown={(e) => {
                            // prevent blur from closing before click registers
                            e.preventDefault();
                            handleSelectAccount(account);
                          }}
                          className="w-full text-left px-4 py-2.5 hover:bg-blue-50 transition-colors border-b border-gray-100 last:border-0"
                        >
                          <p className="text-sm font-medium text-gray-900">
                            {account.debtorName}
                          </p>
                          <p className="text-xs text-gray-500 mt-0.5">
                            Acct #{account.accountNumber}
                            {account.debtorAddress ? ` · ${account.debtorAddress}` : ""}
                            {" · "}
                            <span className="font-medium text-gray-700">
                              ₱{Number(account.balance).toLocaleString("en-PH", {
                                minimumFractionDigits: 2,
                              })}
                            </span>
                          </p>
                        </button>
                      ))
                    )}
                  </div>
                )}
              </div>

              {/* Selected account badge */}
              {selectedAccount && (
                <div className="mt-2 flex items-center justify-between px-3 py-2 bg-green-50 border border-green-200 rounded-lg">
                  <div className="text-xs text-green-700">
                    <span className="font-semibold">
                      Acct #{selectedAccount.accountNumber}
                    </span>
                    <span className="mx-1.5 text-green-400">·</span>
                    <span className="uppercase font-medium">{selectedAccount.status}</span>
                    {selectedAccount.assignedOfficerName && (
                      <>
                        <span className="mx-1.5 text-green-400">·</span>
                        <span>Officer: {selectedAccount.assignedOfficerName}</span>
                      </>
                    )}
                  </div>
                  <button
                    type="button"
                    onClick={clearSelection}
                    className="text-green-500 hover:text-green-700 ml-2"
                    title="Clear selection"
                  >
                    <X className="w-3.5 h-3.5" />
                  </button>
                </div>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Debtor Address</label>
              <textarea
                name="debtorAddress"
                value={formData.debtorAddress}
                onChange={handleChange}
                rows={2}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Creditor Account Reference
              </label>
              <input
                type="text"
                name="creditorReference"
                value={formData.creditorReference}
                onChange={handleChange}
                placeholder="Account number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Original Amount (PHP)
                </label>
                <input
                  type="number"
                  name="originalAmount"
                  value={formData.originalAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Current Balance (PHP)
                </label>
                <input
                  type="number"
                  name="currentAmount"
                  value={formData.currentAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">
                Payment Due Date
              </label>
              <input
                type="date"
                name="dueDate"
                value={formData.dueDate}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            {validationMessage && (
              <div className="rounded-lg border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
                {validationMessage}
              </div>
            )}

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                onClick={handleDownloadPDF}
                disabled={pdfLoading}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {pdfLoading ? (
                  <Loader2 className="w-4 h-4 animate-spin" />
                ) : (
                  <Download className="w-4 h-4" />
                )}
                {pdfLoading ? "Generating…" : "Download PDF"}
              </button>
              <button
                type="button"
                onClick={handleSend}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Send className="w-4 h-4" />
                Send via Email
              </button>
            </div>
          </form>
        </div>

        {/* ── Live Preview ── */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
            <button
              type="button"
              onClick={() => setShowTemplateEditor((v) => !v)}
              className="inline-flex items-center justify-center rounded-md p-2 border border-gray-200 bg-white hover:bg-gray-100 text-gray-600"
              aria-pressed={showTemplateEditor}
              aria-label="Toggle template editor"
            >
              <FileText className="w-5 h-5 text-gray-400" />
            </button>
          </div>

          {showTemplateEditor && (
            <div className="rounded-lg border border-gray-200 bg-slate-50 p-4 mb-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="text-md font-semibold text-gray-900">Template Editor</h4>
                <button
                  type="button"
                  onClick={() => setShowTemplateEditor(false)}
                  className="text-sm text-blue-600 hover:text-blue-800"
                >
                  Close
                </button>
              </div>
              <div className="space-y-4">
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Subject Template
                  </label>
                  <input
                    type="text"
                    name="subjectTemplate"
                    value={templateConfig.subjectTemplate}
                    onChange={handleTemplateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">
                    Body Template
                  </label>
                  <textarea
                    name="bodyTemplate"
                    value={templateConfig.bodyTemplate}
                    onChange={handleTemplateChange}
                    rows={10}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Signatory Name
                    </label>
                    <input
                      type="text"
                      name="closingName"
                      value={templateConfig.closingName}
                      onChange={handleTemplateChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Signatory Title
                    </label>
                    <input
                      type="text"
                      name="closingTitle"
                      value={templateConfig.closingTitle}
                      onChange={handleTemplateChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                </div>
              </div>
            </div>
          )}

          <div className="bg-white border border-gray-300 rounded-lg p-8 shadow-sm min-h-[600px] font-serif">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center border-b-2 border-gray-800 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">{templateConfig.agencyName}</h1>
                <p className="text-sm text-gray-600">{templateConfig.agencyAddress}</p>
              </div>

              {/* Date */}
              <div className="text-right text-sm">{currentDate}</div>

              {/* Recipient */}
              <div>
                <p className="font-semibold">{formData.debtorName || "[Debtor Name]"}</p>
                <p className="text-sm whitespace-pre-line">
                  {formData.debtorAddress || "[Debtor Address]"}
                </p>
              </div>

              {/* Subject */}
              <div>
                <p className="font-bold">{renderTemplate(templateConfig.subjectTemplate)}</p>
              </div>

              {/* Body */}
              <div className="space-y-4 text-sm leading-relaxed whitespace-pre-line">
                {renderTemplate(templateConfig.bodyTemplate)}
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
