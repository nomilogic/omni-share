import { useState } from "react";

export interface Wallet {
  balance: number;
  currency: string;
  transactions: Array<{
    id: string;
    amount: number;
    type: "credit" | "debit";
    description?: string;
    date: string;
  }>;
}

export function useWallet(
  initialBalance: number = 0,
  currency: string = "USD"
) {
  const [wallet, setWallet] = useState<Wallet>({
    balance: initialBalance,
    currency,
    transactions: [],
  });

  function credit(amount: number, description?: string) {
    setWallet((prev) => ({
      ...prev,
      balance: prev.balance + amount,
      transactions: [
        ...prev.transactions,
        {
          id: crypto.randomUUID(),
          amount,
          type: "credit",
          description,
          date: new Date().toISOString(),
        },
      ],
    }));
  }

  function debit(amount: number, description?: string) {
    setWallet((prev) => ({
      ...prev,
      balance: prev.balance - amount,
      transactions: [
        ...prev.transactions,
        {
          id: crypto.randomUUID(),
          amount,
          type: "debit",
          description,
          date: new Date().toISOString(),
        },
      ],
    }));
  }

  return { wallet, credit, debit };
}
