import React from "react";

interface ProgressBarProps {
  currentStep: number;
  totalSteps: number;
  stepLabels: string[];
}

export const ProgressBar: React.FC<ProgressBarProps> = ({
  currentStep,
  totalSteps,
  stepLabels,
}) => {
  return (
    <div className="w-full mb-8">
      <div className="flex justify-between items-center mb-4">
        {stepLabels.map((label, index) => (
          <div
            key={index}
            className={`flex flex-col items-center ${
              index <= currentStep ? "text-white" : "text-white-400"
            }`}
          >
            <div
              className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-medium mb-2 transition-all duration-300 ${
                index < currentStep
                  ? "bg-blue-600 text-white"
                  : index === currentStep
                    ? "bg-black text-white-600 border-2 border-white-600"
                    : "bg-white text-black"
              }`}
            >
              {index < currentStep ? "✓" : index + 1}
            </div>
            <span className="text-xs font-medium text-center text-white">
              {label}
            </span>
          </div>
        ))}
      </div>
      <div className="w-full bg-gray-200 rounded-full h-2">
        <div
          className="bg-gradient-to-r from-orange-500 to-blue-600 h-2 rounded-full transition-all duration-500 ease-out"
          style={{ width: `${((currentStep + 1) / totalSteps) * 100}%` }}
        />
      </div>
    </div>
  );
};
