import React, { useState } from 'react';
import { X, CreditCard, FileText, ChevronRight, PlusCircle, Subscript } from 'lucide-react';
import Illustration from "../assets/manarge-subscription-img.png";
import Transactions from "../assets/transactions.png";
import SubscriptionPauseModal from './SubscriptionPauseModal';
import { AccountsPage } from './../pages/AccountsPage';
import TransactionHistory from '@/pages/TransectionHistory';

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
  onCancelSubscription,
  onAddCoins,
}) => {
  const [selected, setSelected] = useState<string | null>(null);
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [showTransactions, setShowTransactions] = useState(false);
  const [showManageSubscription, setShowManageSubscription] = useState(true);

  if (!isOpen) return null;

 const onViewInvoices = () => {
    setShowManageSubscription(false);
    setShowTransactions(true);
  }

  const _onClose = () => {
    setShowManageSubscription(false);
    setShowTransactions(false);
    onClose();
     setIsModalOpen(false);
  }

  return (
    <div className="fixed inset-0 z-[260] flex items-center justify-center p-0">
      <div
        className="absolute inset-0 bg-black/40 backdrop-blur-sm"
        onClick={onClose}
        aria-hidden
      />
      <SubscriptionPauseModal 
        isVisible={isModalOpen}
        onClose={() => {
          setIsModalOpen(false);
               _onClose();
        }}
        onCancel={() => {
          onCancelSubscription && onCancelSubscription();
          setIsModalOpen(false);
     
        }}
        onPause={() => {}}
      />

      <div className="relative w-full md:max-w-3xl lg:max-w-5xl md:rounded-2xl overflow-hidden shadow-2xl bg-white h-full md:h-auto w">
        <div className="flex flex-col md:flex-row  md:h-fit">
          {/* Left: Illustration */}
          <div className=" bg-[#7650e3] p-0 flex items-center justify-center h-[30vh] md:h-auto md:w-1/2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={Illustration}
              alt="Manage subscription illustration"
              className="w-full h-full object-contain md:p-20 rounded-2xl"
            />
          </div>

          {/* Right: Actions */}
          <div className="md:w-1/2 p-6 z-">
            {/* Close button as a purple circle in top-right */}
            <button
              onClick={_onClose}
              className="absolute right-4 top-4 w-7 h-7 z-1000 rounded-full border border-[#7650e3] flex items-center justify-center text-[#7650e3] bg-[#F7F5FB] transition-shadow border-[3px]"
              aria-label="Close manage subscription dialog"
            >
              <X className="w-5 h-5  color-[#7650e3] stroke-[#7650e3] stroke-[3] " />
            </button>

            <div className="mb-20">
              <h3 className="text-md font-semibold text-[#7650e3]">
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
                  "w-full flex items-center justify-between py-2 px-3 rounded-md text-md font-medium transition-all hover:bg-[#d7d7fc] text-[#7650e3]";

                const buttonClass =
                  "bg-white border border-[#7650e3] text-[#7650e3] hover:shadow-sm";

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
                        if (action.key === "cancel") setIsModalOpen(true);
                        if (action.key === "coins") onAddCoins && onAddCoins();
                      }, 120);
                    }}
                    className={`${commonClasses} ${buttonClass}`}
                  >
                    <div className="flex items-center gap-1">
                      {action.label}
                    </div>
                    <ChevronRight className={` w-6 h-6`} />
                  </button>
                );
              })}
            </div>
          </div>
        </div>
      </div>
    {showTransactions &&  <div className="absolute w-full md:max-w-4xl lg:max-w-6xl md:rounded-2xl overflow-hidden shadow-2xl bg-[#F7F5FB] h-full md:h-auto ">
        <div className="flex flex-col md:flex-row  md:h-fit">
          {/* Left: Illustration */}
          <div className=" bg-[#7650e3] p-0 flex items-center justify-center h-[30vh] md:h-auto md:w-1/2">
            {/* eslint-disable-next-line @next/next/no-img-element */}
            <img
              src={Transactions}
              alt="Manage subscription illustration"
              className="w-full h-full object-contain md:p-20 rounded-2xl"
            />
          </div>

          {/* Right: Actions */}
          <div className="md:w-1/2 p-6 z-">
            {/* Close button as a purple circle in top-right */}
            <button
              onClick={_onClose}
              className="absolute right-4 top-4 w-7 h-7 z-1000 rounded-full border border-[#7650e3] flex items-center justify-center text-[#7650e3] bg-[#F7F5FB] transition-shadow border-[3px]"
              aria-label="Close manage subscription dialog"
            >
              <X className="w-5 h-5  color-[#7650e3] stroke-[#7650e3] stroke-[3] " />
            </button>

            <div className="">
              <h3 className="text-2xl font-semibold text-[#7650e3]">
                View Invoices
              </h3>
            </div>

            <div className="space-y-3 mt-6 h-[58vh] overflow-y-auto">
              <TransactionHistory />
            </div>
          </div>
        </div>
      </div>}
    </div>
  );
};
