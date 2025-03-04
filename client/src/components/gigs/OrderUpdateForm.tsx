"use client";

import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";

type OrderUpdateFormProps = {
  orderId: string;
};

export default function OrderUpdateForm({ orderId }: OrderUpdateFormProps) {
  const { token } = useAuthStore();
  // Initialize selectedStatus from localStorage or default to "PENDING"
  const [selectedStatus, setSelectedStatus] = useState<string>(() => {
    if (typeof window !== "undefined") {
      return localStorage.getItem("orderStatus_" + orderId) || "PENDING";
    }
    return "PENDING";
  });
  const [updateTitle, setUpdateTitle] = useState("");
  const [updateContent, setUpdateContent] = useState("");
  // New state for expected delivery date (optional)
  const [expectedDeliveryDate, setExpectedDeliveryDate] = useState("");
  const [existingUpdates, setExistingUpdates] = useState<any[]>([]);
  const [loadingUpdates, setLoadingUpdates] = useState(true);
  const [updateError, setUpdateError] = useState("");

  // Save selectedStatus to localStorage whenever it changes
  useEffect(() => {
    if (typeof window !== "undefined") {
      localStorage.setItem("orderStatus_" + orderId, selectedStatus);
    }
  }, [selectedStatus, orderId]);

  // Fetch existing updates for the order
  useEffect(() => {
    const fetchUpdates = async () => {
      try {
        const res = await fetch(`http://localhost:8800/api/gig-order-updates/${orderId}`, {
          headers: {
            Authorization: `Bearer ${token}`,
          },
          credentials: "include",
        });
        if (!res.ok) {
          throw new Error("Failed to fetch updates");
        }
        const data = await res.json();
        setExistingUpdates(data);
      } catch (err) {
        console.error("Error fetching order updates", err);
      } finally {
        setLoadingUpdates(false);
      }
    };
    fetchUpdates();
  }, [orderId, token]);

  // Handler to update the order status using the dropdown
  const handleStatusUpdate = async () => {
    if (!selectedStatus) return;
    try {
      const res = await fetch(`http://localhost:8800/api/gig-order-updates/status/${orderId}`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ status: selectedStatus }),
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to update order status");
      }
      alert("Order status updated successfully");
    } catch (err: any) {
      console.error("Error updating order status", err);
      setUpdateError(err.message || "Failed to update order status");
    }
  };

  // Handler to create a new order update (title, content, gigOrderId, and optionally expectedDeliveryDate)
  const handleCreateUpdate = async () => {
    if (!updateTitle || !updateContent) return;
    try {
      const requestBody: any = {
        gigOrderId: orderId,
        title: updateTitle,
        content: updateContent,
      };
      if (expectedDeliveryDate) {
        // Optionally, send the date as an ISO string
        requestBody.expectedDeliveryDate = expectedDeliveryDate;
      }
      const res = await fetch(`http://localhost:8800/api/gig-order-updates/${orderId}`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(requestBody),
        credentials: "include",
      });
      if (!res.ok) {
        throw new Error("Failed to create order update");
      }
      const newUpdate = await res.json();
      setExistingUpdates((prev) => [...prev, newUpdate]);
      setUpdateTitle("");
      setUpdateContent("");
      setExpectedDeliveryDate("");
    } catch (err: any) {
      console.error("Error creating order update", err);
      setUpdateError(err.message || "Failed to create order update");
    }
  };

  return (
    <div className="mt-8 border p-6 rounded-lg bg-white shadow">
      <h3 className="text-2xl font-bold mb-4">Order Updates</h3>
      {updateError && <p className="text-red-500 mb-2">{updateError}</p>}
      <div className="mb-4">
        <label className="block text-sm font-medium text-gray-700">Update Order Status</label>
        <div className="flex items-center space-x-4 mt-2">
          <select
            value={selectedStatus}
            onChange={(e) => setSelectedStatus(e.target.value)}
            className="border rounded p-2"
          >
            <option value="PENDING">PENDING</option>
            <option value="IN_PROGRESS">IN_PROGRESS</option>
            <option value="COMPLETED">COMPLETED</option>
            <option value="DELIVERED">DELIVERED</option>
          </select>
          <Button onClick={handleStatusUpdate}>Update Status</Button>
        </div>
      </div>
      <div className="mb-4">
        <h4 className="text-xl font-semibold mb-2">Add Order Update</h4>
        <input
          type="text"
          placeholder="Title"
          value={updateTitle}
          onChange={(e) => setUpdateTitle(e.target.value)}
          className="border rounded p-2 w-full mb-2"
        />
        <textarea
          placeholder="Content"
          value={updateContent}
          onChange={(e) => setUpdateContent(e.target.value)}
          className="border rounded p-2 w-full mb-2"
          rows={3}
        />
        {/* Expected Delivery Date (optional) */}
        <div className="mb-2">
          <label className="block text-sm font-medium text-gray-700">Expected Delivery Date (optional)</label>
          <input
            type="date"
            value={expectedDeliveryDate}
            onChange={(e) => setExpectedDeliveryDate(e.target.value)}
            className="border rounded p-2 w-full"
          />
        </div>
        <Button onClick={handleCreateUpdate}>Submit Update</Button>
      </div>
      <div>
        <h4 className="text-xl font-semibold mb-2">Existing Updates</h4>
        {loadingUpdates ? (
          <p>Loading updates...</p>
        ) : existingUpdates.length > 0 ? (
          <ul className="space-y-3">
            {existingUpdates.map((upd: any) => (
              <li key={upd.id} className="border p-3 rounded bg-gray-50">
                <p className="font-bold text-lg">{upd.title}</p>
                <p>{upd.content}</p>
                {upd.expectedDeliveryDate && (
                  <p className="text-sm text-blue-700">
                    Expected Delivery:{" "}
                    {new Date(upd.expectedDeliveryDate).toLocaleDateString()}
                  </p>
                )}
                <p className="text-sm text-gray-500">
                  {new Date(upd.createdAt).toLocaleString()}
                </p>
              </li>
            ))}
          </ul>
        ) : (
          <p>No updates yet.</p>
        )}
      </div>
    </div>
  );
}
