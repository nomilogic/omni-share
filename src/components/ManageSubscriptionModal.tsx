import React, { useState } from 'react';
import { X, CreditCard, FileText, ChevronRight, PlusCircle } from 'lucide-react';
import Illustration from "../assets/manarge-subscription-img.png";

interface ManageSubscriptionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onUpdatePayment?: () => void;
  onViewInvoices?: () => void;
  onCancelSubscription?: () => void;
  onAddCoins?: () => void;
}

export const ManageSubscriptionModal: React.FC<ManageSubscriptionModalProps> = ({
  isOpen,
  onClose,
  onUpdatePayment,
  onViewInvoices,
  onCancelSubscription,
  onAddCoins,
}) => {
  const [selected, setSelected] = useState<string | null>(null);

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center p-4">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />

      <div className="relative w-full max-w-5xl rounded-2xl overflow-hidden shadow-2xl bg-white ">
        <div className="flex flex-col lg:flex-row lg:min-h-[60vh]">
          {/* Left: Illustration */}
          <div className=" bg-[#7650e3] p-6 flex items-center justify-center lg:w-1/2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={Illustration}
              alt="Manage subscription illustration"
              className="w-full h-full object-contain rounded-2xl"
            />
          </div>

          {/* Right: Actions */}
          <div className="lg:w-1/2 p-6 relative">
            {/* Close button as a purple circle in top-right */}
            <button
              onClick={onClose}
              className="absolute right-4 top-4 w-7 h-7 rounded-full border border-[#7650e3] flex items-center justify-center text-[#7650e3] hover:bg-[#F7F5FB] transition-shadow border-[3px]"
              aria-label="Close manage subscription dialog"
            >
              <X className="w-5 h-5  color-[#7650e3] stroke-[#7650e3] stroke-[3] " />
            </button>

            <div className="mb-20">
              <h3 className="text-lg font-semibold text-[#7650e3]">
                Manage Subscription
              </h3>
            </div>
            <div className="text-md font-medium text-[#7650e3] mb-[-1rem] ">
              How can we help you today?
            </div>
            <div className="space-y-3 mt-6">
              {[
                {
                  key: "update",
                  label: "Update Payment Method",
                  icon: <CreditCard className="w-4 h-4" />,
                },
                {
                  key: "invoices",
                  label: "View Invoices",
                  icon: <FileText className="w-4 h-4 text-white" />,
                },
                {
                  key: "cancel",
                  label: "Cancel Your Subscription",
                  icon: (
                    <ChevronRight className="w-4 h-4 rotate-180 transform text-red-600" />
                  ),
                },
                {
                  key: "coins",
                  label: "Add Omni Coins",
                  icon: <PlusCircle className="w-4 h-4" />,
                },
              ].map((action) => {
                const isSelected = selected === action.key;
                const commonClasses =
                  "w-full flex items-center justify-between py-2 px-3 rounded-lg text-md font-medium transition-all hover:bg-[#d7d7fc] ";

                const buttonClass = isSelected
                  ? "theme-bg-quaternary text-white shadow-sm ring-1 ring-[#7650e3] hover:bg-[#7650e3]"
                  : "bg-white border border-[#7650e3] text-[#7650e3] hover:shadow-sm";

                return (
                  <button
                    key={action.key}
                    onClick={() => {
                      setSelected(action.key);
                      // call external handlers after slight delay to show selection
                      setTimeout(() => {
                        if (action.key === "update")
                          onUpdatePayment && onUpdatePayment();
                        if (action.key === "invoices")
                          onViewInvoices && onViewInvoices();
                        if (action.key === "cancel")
                          onCancelSubscription && onCancelSubscription();
                        if (action.key === "coins") onAddCoins && onAddCoins();
                      }, 120);
                    }}
                    className={`${commonClasses} ${buttonClass}`}
                  >
                    <div className="flex items-center gap-1">
                   
                        {action.label}
                    </div>
                    <ChevronRight   
                      className={` w-6 h-6`}
                    />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};
