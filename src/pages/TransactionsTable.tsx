import React from "react";
import { Download } from "lucide-react";
import API from "@/services/api";

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
                <span className="font-semibold text-gray-800">
                  {item.user.name}
                </span>
                <span className="text-sm text-gray-500">{item.user.email}</span>

                <div className="mt-2 text-sm text-gray-600">
                  <div>
                    <span className="font-medium">Package:</span>{" "}
                    {item.package.name} ({item.package.tier})
                  </div>
                  <div>
                    <span className="font-medium">Coins:</span>{" "}
                    {item.coins.toLocaleString()}
                  </div>
                  <div>
                    <span className="font-medium">Amount:</span> ${item.amount}
                  </div>
                </div>

                <div className="mt-2">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.status === "succeeded"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>
                  <span className="ml-3 text-xs text-gray-500 capitalize">
                    {item.type}
                  </span>
                </div>
              </div>

              <button
                onClick={async () => {
                  window.open(item.stripeCheckoutUrl, "_blank");
                }}
                className="flex items-center gap-2 bg-[#7650e3] text-white px-4 py-2 rounded-lg hover:bg-[#6540d0] transition"
              >
                <span className="text-sm font-medium">Receipt Link</span>
              </button>
            </div>
          ))
        )}
      </div>
    </div>
  );
};

export default TransactionsHistoryBox;
