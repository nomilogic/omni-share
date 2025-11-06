import React, { useEffect, useState } from "react";
import TransactionsTable from "./TransactionsTable";
import API from "@/services/api";
import { Loader } from "lucide-react";

const TransactionHistory = () => {
  const [history, setHistory] = useState([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        setIsLoading(true);
        const response = await API.walletTransaction();
        const data = await response.data.transactions;
        setHistory(data);
      } catch (error) {
        console.error("Error fetching history:", error);
      } finally {
        setIsLoading(false);
      }
    };

    fetchHistory();
  }, []);

  if (isLoading) {
    return (
      <div className="w-full h-[400px] flex items-center justify-center">
        <div className="flex flex-col items-center gap-3">
          <Loader className="w-8 h-8 text-[#7650e3] animate-spin" />
          <p className="text-[#7650e3] text-sm font-medium animate-pulse">
            Loading transactions...
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="w-full">
      {history.length === 0 ? (
        <div className="text-center text-gray-500 py-8">
          No transaction history found
        </div>
      ) : (
        <TransactionsTable data={history} />
      )}
    </div>
  );
};

export default TransactionHistory;
