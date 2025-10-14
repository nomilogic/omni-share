import React from "react";

const TransactionsTable = ({ data }: any) => {
  return (
    <div className="w-full bg-[#7650e3] border border-gray-200 rounded-2xl shadow-sm p-6">
      <h2 className="text-xl font-semibold text-white mb-4">
        Recent Transactions
      </h2>

      <div className="overflow-x-auto h-[75vh] overflow-scroll ">
        <table className="w-full border-collapse ">
          <thead className="sticky top-0 ">
            <tr className="bg-gray-50 text-black text-sm uppercase tracking-wide">
              <th className="px-4 py-3 text-left font-medium">User</th>
              <th className="px-4 py-3 text-left font-medium">Package</th>
              <th className="px-4 py-3 text-left font-medium">Coins</th>
              <th className="px-4 py-3 text-left font-medium">Amount</th>
              <th className="px-4 py-3 text-left font-medium">Type</th>
              <th className="px-4 py-3 text-left font-medium">Status</th>
            </tr>
          </thead>

          <tbody>
            {data.map((item: any) => (
              <tr
                key={item.id}
                className="border-t border-gray-100 hover:bg-black transition-colors"
              >
                <td className="px-4 py-3 text-white font-medium">
                  {item.user.name}
                  <div className="text-xs text-white ">{item.user.email}</div>
                </td>

                <td className="px-4 py-3 text-white">
                  {item.package.name}
                  <div className="text-xs text-white  capitalize">
                    {item.package.tier}
                  </div>
                </td>

                <td className="px-4 py-3 text-white">
                  {item.coins.toLocaleString()}
                </td>

                <td className="px-4 py-3 font-medium text-white">
                  ${item.amount}
                </td>

                <td className="px-4 py-3 capitalize text-white">{item.type}</td>

                <td className="px-4 py-3">
                  <span
                    className={`px-2 py-1 rounded-full text-xs font-semibold ${
                      item.status === "succeeded"
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {item.status}
                  </span>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default TransactionsTable;
