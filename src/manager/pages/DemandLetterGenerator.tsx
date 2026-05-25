import { useState } from "react";
import { FileText, Download, Send } from "lucide-react";

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

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
    setValidationMessage(null);
  };

  const handleTemplateChange = (e: React.ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setTemplateConfig({ ...templateConfig, [e.target.name]: e.target.value });
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const renderTemplate = (template: string) => {
    const values = {
      debtorName: formData.debtorName || "[Debtor Name]",
      debtorAddress: formData.debtorAddress || "[Debtor Address]",
      accountNumber: formData.creditorReference || "[Account Number]",
      originalAmount: formData.originalAmount || "[Original Amount]",
      currentAmount: formData.currentAmount || "[Outstanding Balance]",
      dueDate: formData.dueDate || "[Due Date]",
      closingName: templateConfig.closingName,
      closingTitle: templateConfig.closingTitle,
    } as Record<string, string>;

    return template.replace(/\{(\w+)\}/g, (_, key) => values[key] ?? "");
  };

  const validateRequiredFields = () => {
    const missingFields: string[] = [];

    if (!formData.debtorName.trim()) {
      missingFields.push("Debtor's full name");
    }
    if (!formData.debtorAddress.trim()) {
      missingFields.push("Debtor's address");
    }
    if (!formData.currentAmount.trim()) {
      missingFields.push("Outstanding balance");
    }

    return missingFields;
  };

  const handleGenerate = (action: "download" | "send") => {
    const missingFields = validateRequiredFields();

    if (missingFields.length > 0) {
      setValidationMessage(
        `Cannot ${action === "download" ? "generate" : "send"} the demand letter. Please provide: ${missingFields.join(", ")}.`
      );
      return;
    }

    setValidationMessage(null);

    if (action === "download") {
      // Placeholder: integrate PDF generation later
      window.alert("Demand letter is ready to download.");
    } else {
      window.alert("Demand letter is ready to send.");
    }
  };

  return (
    <div className="p-6">
      <div className="mb-6">
        <h2 className="text-3xl font-bold text-gray-900">Demand Letter Generator</h2>
        <p className="text-gray-500 mt-1">Create professional demand letters with live preview</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Form */}
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

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-1">Debtor Name</label>
              <input
                type="text"
                name="debtorName"
                value={formData.debtorName}
                onChange={handleChange}
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Creditor Account Reference</label>
              <input
                type="text"
                name="creditorReference"
                value={formData.creditorReference}
                onChange={handleChange}
                placeholder="Creditor's reference number"
                className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Original Amount</label>
                <input
                  type="number"
                  name="originalAmount"
                  value={formData.originalAmount}
                  onChange={handleChange}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">Current Amount</label>
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
              <label className="block text-sm font-medium text-gray-700 mb-1">Payment Due Date</label>
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
                onClick={() => handleGenerate("download")}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                type="button"
                onClick={() => handleGenerate("send")}
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              >
                <Send className="w-4 h-4" />
                Send via Email
              </button>
            </div>
          </form>
        </div>

        {/* Live Preview */}
        <div className="bg-white rounded-lg border border-gray-200 p-6">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-semibold text-gray-900">Live Preview</h3>
            <button
              type="button"
              onClick={() => setShowTemplateEditor((current) => !current)}
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
                  <label className="block text-sm font-medium text-gray-700 mb-1">Subject Template</label>
                  <input
                    type="text"
                    name="subjectTemplate"
                    value={templateConfig.subjectTemplate}
                    onChange={handleTemplateChange}
                    className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-gray-700 mb-1">Body Template</label>
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
                    <label className="block text-sm font-medium text-gray-700 mb-1">Signatory Name</label>
                    <input
                      type="text"
                      name="closingName"
                      value={templateConfig.closingName}
                      onChange={handleTemplateChange}
                      className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Signatory Title</label>
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
                <p className="text-sm whitespace-pre-line">{formData.debtorAddress || "[Debtor Address]"}</p>
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
