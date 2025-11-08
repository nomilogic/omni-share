import React, { useEffect, useState } from "react";
import { useForm } from "react-hook-form";
import { Edit2, Trash2, Loader2, Plus } from "lucide-react";
import API from "@/services/api";

const API_BASE =
  import.meta.env.VITE_API_URL ||
  "https://omnishare.ai/server/api" + "/admin/generation-amount";

const GenerationAmountPage = () => {
  const [generationAmounts, setGenerationAmounts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingId, setEditingId] = useState(null);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { isSubmitting },
  } = useForm({
    defaultValues: {
      type: "",
      amount: "",
    },
  });

  // Fetch Data
  const fetchData = async () => {
    try {
      setLoading(true);
      const res = await API.getGenerateAmount();
      const data = await res.data;
      setGenerationAmounts(data.data || []);
    } catch (err) {
      console.error("Error fetching:", err);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    fetchData();
  }, []);

  const onSubmit = async (formData: any) => {
    try {
      const res = editingId
        ? await API.updateGenerateAmount(editingId, formData)
        : await API.createGenerateAmount(formData);

      if (res.data) {
        reset({ type: "", amount: "" });
        setEditingId(null);
        fetchData();
      } else {
        window.alert("type  already exists.");
      }
    } catch (error: any) {
      window.alert(error.message || error.response.data.message);
      console.error("Error saving:", error);
    }
  };

  // Handle Edit
  const handleEdit = (item: any) => {
    setEditingId(item.id);
    setValue("type", item.type);
    setValue("amount", item.amount);
  };

  // Handle Delete
  const handleDelete = async (id: any) => {
    if (!window.confirm("Are you sure you want to delete this item?")) return;
    try {
      await API.deleteGenerateAmount(id);
      fetchData();
    } catch (error) {
      console.error("Error deleting:", error);
    }
  };

  return (
    <div className="p-6 bg-white min-h-screen text-black">
      <div className="max-w-4xl mx-auto bg-[#f9f9f9] border border-gray-200 shadow-sm rounded-2xl p-6">
        <h1 className="text-2xl font-semibold text-black mb-6">
          Generation Amount Management
        </h1>

        {/* Form Section */}
        <form
          onSubmit={handleSubmit(onSubmit)}
          className="grid grid-cols-1 md:grid-cols-3 gap-3 items-center mb-6"
        >
          {/* Type Selector */}
          <select
            {...register("type", { required: true })}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-black outline-none text-gray-800 bg-white"
          >
            <option value="">Select Type</option>
            <option value="image">Image</option>
            <option value="text">Text</option>
          </select>

          {/* Amount Input */}
          <input
            type="number"
            placeholder="Enter Amount"
            {...register("amount", { required: true })}
            className="border border-gray-300 rounded-md px-3 py-2 focus:ring-1 focus:ring-black outline-none text-gray-800 bg-white"
          />

          {/* Submit Button */}
          <button
            type="submit"
            disabled={isSubmitting}
            className="flex items-center justify-center gap-2 bg-black text-white font-medium px-4 py-2 rounded-md hover:bg-gray-900 transition-all disabled:opacity-60"
          >
            {isSubmitting ? (
              <>
                <Loader2 className="w-4 h-4 animate-spin" /> Saving...
              </>
            ) : (
              <>
                <Plus className="w-4 h-4" />
                {editingId ? "Update" : "Add"}
              </>
            )}
          </button>
        </form>

        {/* Table Section */}
        <div className="overflow-x-auto">
          {loading ? (
            <div className="flex justify-center py-8">
              <Loader2 className="w-6 h-6 animate-spin text-black" />
            </div>
          ) : generationAmounts.length === 0 ? (
            <p className="text-slate-500 text-center py-6">
              No generation amounts found.
            </p>
          ) : (
            <table className="min-w-full border border-gray-200 rounded-md overflow-hidden">
              <thead className="bg-gray-100 text-gray-800 text-sm uppercase">
                <tr>
                  <th className="px-4 py-2 text-left font-medium">Type</th>
                  <th className="px-4 py-2 text-left font-medium">Amount</th>
                  <th className="px-4 py-2 text-right font-medium">Actions</th>
                </tr>
              </thead>
              <tbody>
                {generationAmounts.map((item: any) => (
                  <tr
                    key={item.id}
                    className="border-t hover:bg-gray-50 transition-all"
                  >
                    <td className="px-4 py-2 capitalize">{item.type}</td>
                    <td className="px-4 py-2 text-gray-700">{item.amount}</td>
                    <td className="px-4 py-2 text-right flex justify-end gap-2">
                      <button
                        onClick={() => handleEdit(item)}
                        className="text-black hover:text-gray-700 p-1"
                      >
                        <Edit2 className="w-4 h-4" />
                      </button>
                      <button
                        onClick={() => handleDelete(item.id)}
                        className="text-gray-700 hover:text-black p-1"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          )}
        </div>
      </div>
    </div>
  );
};

export default GenerationAmountPage;
