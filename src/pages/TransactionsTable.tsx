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
              className="w-full  border-2 border-purple-600 rounded-2xl p-6 bg-white shadow-sm hover:shadow-lg transition-all duration-300"
            >
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-purple-600">
                  Standard Monthly Subscription
                </h2>
                {item.hostedInvoiceUrl ? (
                  <button
                    onClick={() => window.open(item.hostedInvoiceUrl, "_blank")}
                    className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-3 py-1 text-sm rounded-md transition-colors"
                  >
                    Invoice
                  </button>
                ) : (
                  <button
                    disabled
                    className="bg-gray-300 text-black font-semibold px-5 py-2 rounded-lg cursor-not-allowed"
                  >
                    {item.autoRenewal ? "Auto-Renewed" : "No Receipt"}
                  </button>
                )}
              </div>

              <div className="space-y-3 text-sm text-black">
                <div className="flex items-center justify-between">
                  <span className="font-medium">Price</span>
                  <span className="font-semibold">
                    ${item.amount || item.amountPaid || 0}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Purchased at</span>
                  <span className="font-semibold">
                    {item.createdAt
                      ? new Date(item.createdAt).toLocaleString()
                      : "N/A"}
                  </span>
                </div>

                <div className="flex items-center justify-between">
                  <span className="font-medium">Purchased code</span>
                  <div className="flex items-center gap-1">
                    <button
                      onClick={() =>
                        navigator.clipboard.writeText(
                          item.transactionId || item.id
                        )
                      }
                      className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                      title="Copy to clipboard"
                    >
                      <svg
                        xmlns="http://www.w3.org/2000/svg"
                        className="h-4 w-4 text-purple-600"
                        fill="none"
                        viewBox="0 0 24 24"
                        stroke="currentColor"
                      >
                        <path
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          strokeWidth="2"
                          d="M8 16h8m-8-4h8m-8-4h8m2 12H6a2 2 0 01-2-2V6a2 2 0 012-2h6l6 6v10a2 2 0 01-2 2z"
                        />
                      </svg>
                    </button>
                    <span className="text-purple-600 font-medium">
                      {item.transactionId || item.id}
                    </span>
                  </div>
                </div>
              </div>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionsHistoryBox;
