import React from "react";
import { Template } from "../types/templates";
import { templates } from "../utils/templates";

interface TemplateSelectorProps {
  onSelectTemplate: (template: Template) => void;
  onCancel: () => void;
}

export const TemplateSelector: React.FC<TemplateSelectorProps> = ({
  onSelectTemplate,
  onCancel,
}) => {
  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 z-50 flex items-center justify-center p-2">
      <div className="bg-white rounded-md shadow-xl max-w-2xl w-full max-h-[80vh] overflow-hidden flex flex-col">
        {/* Header */}
        <div className="p-3 border-b border-gray-200">
          <div className="flex items-center justify-between">
            <h2 className="text-sm font-semibold text-slate-900">
              Choose Template
            </h2>
            <button
              onClick={onCancel}
              className="text-gray-400 hover:text-slate-500 text-lg font-medium"
            >
              ×
            </button>
          </div>
        </div>

        {/* Templates Grid */}
        <div className="flex-1 overflow-y-auto p-3">
          <div className="grid grid-cols-3 sm:grid-cols-4 md:grid-cols-5 gap-2">
            {templates.map((template) => (
              <div
                key={template.id}
                onClick={() => onSelectTemplate(template)}
                className="bg-gray-100 border border-gray-200 rounded p-2 hover:border-blue-500 hover:shadow-md transition-all cursor-pointer group"
              >
                {/* Template Preview */}
                <div className="w-full aspect-square bg-gray-50 rounded flex items-center justify-center border border-gray-200 mb-1">
                  <div className="text-xs text-slate-500 text-center leading-tight">
                    {template.dimensions.width}×{template.dimensions.height}
                  </div>
                </div>

                {/* Template Info */}
                <div className="text-center">
                  <h3 className="text-xs font-medium text-slate-900 truncate group-hover:text-blue-600">
                    {template.name}
                  </h3>
                  <p className="text-xs text-slate-500">
                    {template.elements.length} items
                  </p>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Footer */}
        <div className="p-3 border-t border-gray-200">
          <div className="flex justify-between items-center">
            <p className="text-xs text-slate-500">
              {templates.length} templates
            </p>
            <button
              onClick={onCancel}
              className="px-3 py-1 text-slate-700 bg-gray-100 border border-gray-300 rounded hover:bg-gray-200 transition-colors text-xs"
            >
              Cancel
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};
