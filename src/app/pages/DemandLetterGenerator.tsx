import { useState } from "react";
import { FileText, Download, Send } from "lucide-react";

export function DemandLetterGenerator() {
  const [formData, setFormData] = useState({
    debtorName: "",
    debtorAddress: "",
    accountNumber: "",
    originalAmount: "",
    currentAmount: "",
    dueDate: "",
    letterType: "initial",
  });

  const handleChange = (e: React.ChangeEvent<HTMLInputElement | HTMLSelectElement | HTMLTextAreaElement>) => {
    setFormData({ ...formData, [e.target.name]: e.target.value });
  };

  const currentDate = new Date().toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  });

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
              <label className="block text-sm font-medium text-gray-700 mb-1">Account Number</label>
              <input
                type="text"
                name="accountNumber"
                value={formData.accountNumber}
                onChange={handleChange}
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

            <div className="flex gap-3 pt-4">
              <button
                type="button"
                className="flex-1 flex items-center justify-center gap-2 px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 transition-colors"
              >
                <Download className="w-4 h-4" />
                Download PDF
              </button>
              <button
                type="button"
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
            <FileText className="w-5 h-5 text-gray-400" />
          </div>

          <div className="bg-white border border-gray-300 rounded-lg p-8 shadow-sm min-h-[600px] font-serif">
            <div className="space-y-6">
              {/* Header */}
              <div className="text-center border-b-2 border-gray-800 pb-4">
                <h1 className="text-2xl font-bold text-gray-900">Top Priority Collection Agency</h1>
                <p className="text-sm text-gray-600">xxx,xxx, Iloilo City,5000</p>
              </div>

              {/* Date */}
              <div className="text-right text-sm">{currentDate}</div>

              {/* Recipient */}
              <div>
                <p className="font-semibold">{formData.debtorName}</p>
                <p className="text-sm whitespace-pre-line">{formData.debtorAddress}</p>
              </div>

              {/* Subject */}
              <div>
                <p className="font-bold">
                  RE: Account Number {formData.accountNumber} - Demand for Payment
                </p>
              </div>

              {/* Body */}
              <div className="space-y-4 text-sm leading-relaxed">
                <p>Dear {formData.debtorName}:</p>

                <p>
                  This letter serves as formal notice that you have an outstanding debt in the amount of
                  <strong> PHP {Number(formData.currentAmount).toLocaleString()}</strong> related to Account
                  Number {formData.accountNumber}.
                </p>

                <p>
                  The original amount owed was PHP {Number(formData.originalAmount).toLocaleString()}. Despite
                  our previous attempts to contact you regarding this matter, the debt remains unpaid.
                </p>

                <p>
                  We hereby demand payment in full by <strong>{formData.dueDate}</strong>. Failure to remit
                  payment by this date may result in additional collection actions, including but not limited
                  to reporting to credit bureaus and potential legal proceedings.
                </p>

                <p>Payment can be made by:</p>
                <ul className="list-disc ml-6 space-y-1">
                  <li>Bank transfer to account details provided below</li>
                  <li>Check payable to TPCA</li>
                  <li>Online payment portal at www.TPCA.com/pay</li>
                </ul>

                <p>
                  If you wish to discuss a payment arrangement or dispute this debt, please contact our office
                  immediately at (617) 555-0100.
                </p>

                <p>
                  This is an attempt to collect a debt. Any information obtained will be used for that purpose.
                </p>

                <p className="pt-8">Sincerely,</p>
                <p className="font-semibold">Top Priority Collection Agency</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
