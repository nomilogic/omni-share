import API from "./api";

export type SaveTemplateRequest = {
  name: string;
  json: unknown; // will be stringified if needed
  isPublic?: boolean;
};

export type TemplateApiItem = {
  id?: string;
  name?: string;
  json?: unknown;
  created_at?: string;
  createdAt?: string;
  updated_at?: string;
  updatedAt?: string;
  [key: string]: unknown;
};

const extractTemplatesArray = (responseData: any): TemplateApiItem[] => {
  // Support a bunch of possible shapes:
  // - { data: [...] }
  // - { data: { templates: [...] } }
  // - { templates: [...] }
  // - [...]
  if (Array.isArray(responseData)) return responseData as TemplateApiItem[];
  if (Array.isArray(responseData?.data)) return responseData.data as TemplateApiItem[];
  if (Array.isArray(responseData?.templates)) return responseData.templates as TemplateApiItem[];
  if (Array.isArray(responseData?.data?.templates)) {
    return responseData.data.templates as TemplateApiItem[];
  }
  return [];
};

export const templateService = {
  async saveTemplate(data: SaveTemplateRequest) {
    const payload = {
      name: data.name,
      json:
        typeof data.json === "string" ? data.json : JSON.stringify(data.json),
      ...(data.isPublic ? { isPublic: true } : {}),
    };

    // Token is attached by src/services/api.ts interceptor
    return API.saveTemplate(payload);
  },

  async updateTemplate(id: string, data: SaveTemplateRequest) {
    const payload = {
      name: data.name,
      json:
        typeof data.json === "string" ? data.json : JSON.stringify(data.json),
      ...(data.isPublic ? { isPublic: true } : {}),
    };

    // Token is attached by src/services/api.ts interceptor
    return API.updateTemplate(id, payload);
  },

  async getTemplates(): Promise<TemplateApiItem[]> {
    const res = await API.listTemplates();
    return extractTemplatesArray(res.data);
  },

  async getGlobalTemplates(): Promise<TemplateApiItem[]> {
    const res = await API.listGlobalTemplates();
    return extractTemplatesArray(res.data);
  },

  async deleteTemplate(id: string) {
    // Only delete user-saved templates, not global ones
    // The API endpoint is designed to only allow deletion of user templates
    return API.deleteTemplate(id);
  },
};
