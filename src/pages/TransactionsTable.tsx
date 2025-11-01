import React from "react";

const TransactionsHistoryBox = ({ data }: any) => {
  return (
    <div className="w-full bg-white border border-gray-200 rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-gray-800 mb-4">
        Transaction History
      </h2>

      <div className="flex flex-col gap-4 h-[70vh] overflow-y-auto pr-2">
        {data.length === 0 ? (
          <p className="text-gray-500 text-center mt-10">
            No transactions found.
          </p>
        ) : (
          data.map((item: any) => (
            <div
              key={item.id}
              className="bg-gray-50 border border-gray-200 rounded-xl p-4 flex justify-between items-center hover:shadow-md transition-all duration-200"
            >
              <div className="flex flex-col">
                <div className="mt-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Package:</span>{" "}
                    {item.package?.name || "N/A"} ({item.package?.tier || "N/A"}
                    )
                  </div>
                  <div>
                    <span className="font-medium">Coins:</span>{" "}
                    {item.coins?.toLocaleString() || 0}
                  </div>
                  <div>
                    <span className="font-medium">Amount:</span> $
                    {item.amount || item.amountPaid || 0}
                  </div>
                  <div>
                    <span className="font-medium">Billing Reason:</span>{" "}
                    {item.billingReason || "N/A"}
                  </div>
                  <div>
                    <span className="font-medium">Date:</span>{" "}
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "N/A"}
                  </div>
                </div>

                {/* Status & Type */}
                <div className="mt-2 flex items-center gap-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.status === "paid" || item.status === "succeeded"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>
                  {item.type && (
                    <span className="text-xs text-gray-500 capitalize">
                      {item.type}
                    </span>
                  )}
                  {item.autoRenewal && (
                    <span className="px-2 py-1 rounded-full text-xs bg-blue-100 text-blue-700">
                      Auto-Renewed
                    </span>
                  )}
                </div>
              </div>

              {/* Invoice Button */}
              {item.hostedInvoiceUrl ? (
                <button
                  onClick={() => window.open(item.hostedInvoiceUrl, "_blank")}
                  className="flex items-center gap-2 bg-[#7650e3] text-white px-4 py-2 rounded-lg hover:bg-[#6540d0] transition"
                >
                  <span className="text-sm font-medium">Invoice Link</span>
                </button>
              ) : (
                <button
                  disabled
                  className="flex items-center gap-2 bg-gray-300 text-gray-700 px-4 py-2 rounded-lg cursor-not-allowed"
                >
                  <span className="text-sm font-medium">
                    {item.autoRenewal ? "Auto-Renewed" : "No Receipt"}
                  </span>
                </button>
              )}
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionsHistoryBox;
