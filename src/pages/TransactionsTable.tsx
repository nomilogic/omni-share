import { Copy } from "lucide-react";
import React from "react";

const TransactionsHistoryBox = ({ data }: any) => {
  return (
    <div className="flex flex-col gap-2 w-ful bg-transparent">
      {data?.length === 0 || !data ? (
        <p className="text-slate-500 text-center mt-10">
          No transactions found.
        </p>
      ) : (
        data?.map((item: any) => (
          <div
            key={item?.id}
            className="w-full  border-2 border-purple-600 rounded-lg px-6 py-3  bg-white  hover:shadow-md transition-all duration-300"
          >
            <div className="flex items-center justify-between mb-3">
              <h2 className="text-lg font-semibold text-purple-600">
                Standard-Monthly Subscription
              </h2>
              {item?.hostedInvoiceUrl ? (
                <button
                  onClick={() => window.open(item?.hostedInvoiceUrl, "_blank")}
                  className="bg-purple-700 hover:bg-purple-800 text-white font-semibold px-2 py-1 text-xs rounded transition-colors"
                >
                  Invoice
                </button>
              ) : (
                <button
                  disabled
                  className="bg-gray-300 text-black font-semibold px-2 py-1 text-xs     rounded-md cursor-not-allowed"
                >
                  {item?.autoRenewal ? "Auto-Renewed" : "No Receipt"}
                </button>
              )}
            </div>

            <div className="space-y-1 text-xs text-black">
              <div className="flex items-center justify-between">
                <span className="font-medium">Price</span>
                <span className="font-semibold">
                  ${item?.amount || item?.amountPaid || 0}
                </span>
              </div>

              <div className="flex items-center justify-between">
                <span className="font-medium">Purchased at</span>
                <span className="font-semibold">
                  {item?.createdAt
                    ? new Date(item?.createdAt).toLocaleString()
                    : "N/A"}
                </span>
              </div>

              <div className="flex  justify-between  flex-col lg:flex-row ">
                <span className="font-medium">Purchased code</span>
                <div className="flex items-center gap-1">
                  <button
                    onClick={() =>
                      navigator.clipboard.writeText(
                        item?.transactionId || item?.id
                      )
                    }
                    className="p-0.5 hover:bg-gray-100 rounded transition-colors"
                    title="Copy to clipboard"
                  >
                    <Copy className="w-4 h-4 text-purple-600" />
                  </button>
                  <span className="text-black font-medium">
                    {item?.transactionId || item?.id}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ))
      )}
    </div>
  );
};

export default TransactionsHistoryBox;
