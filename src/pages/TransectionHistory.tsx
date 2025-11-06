import React, { useEffect, useState } from "react";
import TransactionsTable from "./TransactionsTable";
import API from "@/services/api";

const TransactionHistory = () => {
  const [history, setHistory] = useState([]);

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        const response = await API.walletTransaction();
        const data = await response.data.transactions;
        setHistory(data);
      } catch (error) {
        console.error("Error fetching history:", error);
      }
    };

    fetchHistory();
  }, []);
  return (
    <div className="w-full">
      <TransactionsTable data={history} />
    </div>
  );
};

export default TransactionHistory;
