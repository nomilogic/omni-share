import React, { useState, useRef, useEffect } from 'react';

// 1. Define the type for a single currency object
interface Currency {
  code: string;
  name: string;
}

// Currencies list remains the same, but now is implicitly typed as Currency[]
const currencies: Currency[] = [
  { code: 'USD', name: 'USD' },
  { code: 'EUR', name: 'EUR' },
  { code: 'GBP', name: 'GBP' },
  { code: 'CNY', name: 'CNY' },
  { code: 'AUD', name: 'AUD' },
];

// 2. Define the types for the component's props
interface CustomCurrencySelectorProps {
  selectedCurrency: string; // The currently active currency code (e.g., "USD")
  // The setter function passed from the parent component
  setSelectedCurrency: (currencyCode: string) => void; 
}

// 3. Apply the Props type to the functional component
const CustomCurrencySelector: React.FC<CustomCurrencySelectorProps> = ({ 
  selectedCurrency, 
  setSelectedCurrency 
}) => {
  const [isOpen, setIsOpen] = useState(false);
  // Use 'HTMLDivElement' for the ref that points to the main div
  const dropdownRef = useRef<HTMLDivElement>(null); 
  const alignRight = true; 

  const changeCurrency = (currencyCode: string) => {
    // This calls the setSelectedCurrency function passed from the Parent
    setSelectedCurrency(currencyCode);
    setIsOpen(false); // Close the dropdown after selection
  };
  
  // Logic to close dropdown when clicking outside
  useEffect(() => {
    // Specify the type for the event object as MouseEvent
    function handleClickOutside(event: MouseEvent) {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsOpen(false);
      }
    }
    document.addEventListener('mousedown', handleClickOutside);
    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, []);

  return (
    <div className="pb-1 relative" ref={dropdownRef}>
      {/* Toggle Button */}
      <button
        type="button"
        onClick={() => setIsOpen(!isOpen)}
        // Use the existing styles from your old <select> for consistency
        className="rounded-md px-2.5 border-purple-600 border text-purple-600 py-0.5 text-sm font-medium "
        aria-haspopup="true"
        aria-expanded={isOpen}
      >
        {selectedCurrency}
      </button>

      {/* The Custom Dropdown Menu */}
      {isOpen && (
        <div
          role="menu"
          // Apply the custom menu styles from your language dropdown
          className={`mt-2 w-[80px] bg-white rounded-md shadow-lg z-50 overflow-hidden absolute ${alignRight ? "right-0" : "left-0"} `}
        >
          {currencies.map((currency) => (
            <button
              key={currency.code}
              role="menuitem"
              onClick={() => changeCurrency(currency.code)}
              // Apply hover/active styles
              className={`w-full text-left px-4 py-2 text-sm text-purple-600 font-medium transition-colors 
                ${selectedCurrency === currency.code ? 'bg-purple-100' : 'hover:bg-purple-50'}
              `}
            >
              {currency.name}
            </button>
          ))}
        </div>
      )}
    </div>
  );
};

export default CustomCurrencySelector;