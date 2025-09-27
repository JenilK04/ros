// src/Components/Admin/AdminAnalytics.jsx

import React, { useEffect, useState, useRef } from "react";
import Navbar from "../User/navbar";
import ReactApexChart from "react-apexcharts";
import API from "../../services/api";
import { useUser } from "../../Context/userContext";
import { DateRange } from "react-date-range";
import { Calendar } from "lucide-react";
import "react-date-range/dist/styles.css";
import "react-date-range/dist/theme/default.css";
import { format } from "date-fns";

// --- Reusable DatePicker Component (No changes needed here) ---
const DatePicker = ({ appliedStartDate, appliedEndDate, onApply }) => {
  const [pickerVisible, setPickerVisible] = useState(false);
  const [selectionRange, setSelectionRange] = useState({
    startDate: appliedStartDate,
    endDate: appliedEndDate,
    key: "selection",
  });
  const pickerRef = useRef(null);

  useEffect(() => {
    const handleClickOutside = (e) => {
      if (pickerRef.current && !pickerRef.current.contains(e.target)) {
        setPickerVisible(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

  useEffect(() => {
    setSelectionRange({
      startDate: appliedStartDate,
      endDate: appliedEndDate,
      key: "selection",
    });
  }, [appliedStartDate, appliedEndDate]);

  const handleApply = () => {
    onApply(selectionRange.startDate, selectionRange.endDate);
    setPickerVisible(false);
  };

  const handleCancel = () => {
    setSelectionRange({
      startDate: appliedStartDate,
      endDate: appliedEndDate,
      key: "selection",
    });
    setPickerVisible(false);
  };

  return (
    <div className="relative inline-block">
      <button
        onClick={() => setPickerVisible(true)}
        className="flex items-center gap-2 px-3 py-2 border rounded hover:bg-gray-100"
      >
        <Calendar size={20} />
        {`${format(appliedStartDate, "MMM d, yyyy")} - ${format(
          appliedEndDate,
          "MMM d, yyyy"
        )}`}
      </button>

      {pickerVisible && (
        <div
          ref={pickerRef}
          className="absolute z-50 mt-2 p-4 bg-white shadow-lg border rounded"
        >
          <DateRange
            editableDateInputs={true}
            onChange={(item) => setSelectionRange(item.selection)}
            moveRangeOnFirstSelection={false}
            ranges={[selectionRange]}
            months={1}
            direction="horizontal"
            showSelectionPreview={true}
            maxDate={new Date()}
          />
          <div className="mt-2 flex justify-end gap-2">
            <button
              onClick={handleCancel}
              className="px-3 py-1 border rounded hover:bg-gray-100"
            >
              Cancel
            </button>
            <button
              onClick={handleApply}
              className="px-3 py-1 bg-blue-500 text-white rounded hover:bg-blue-600"
            >
              Apply
            </button>
          </div>
        </div>
      )}
    </div>
  );
};


// --- AdminAnalytics Component (Refactored) ---
const AdminAnalytics = () => {
  const { user } = useUser();

  // --- Chart States ---
  const [loginChartData, setLoginChartData] = useState([]);
  const [loginChartOptions, setLoginChartOptions] = useState({
    chart: { id: "login-bar", toolbar: { show: true } },
    xaxis: { categories: [] },
  });

  const [pageChartData, setPageChartData] = useState([]);
  const [pageChartOptions, setPageChartOptions] = useState({
    chart: { id: "page-bar", toolbar: { show: true } },
    xaxis: { categories: [] },
  });

  // --- 1. UNIFIED GLOBAL FILTERS ---
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("all");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });

  // Fetch all users for the dropdown (no change)
  useEffect(() => {
    const fetchUsers = async () => {
      try {
        const res = await API.get("/admin/users");
        setAllUsers(res.data || []);
      } catch (err) {
        console.error("Failed to fetch users", err);
      }
    };
    fetchUsers();
  }, []);

  // --- Fetch Login Analytics ---
  useEffect(() => {
    const fetchLoginAnalytics = async () => {
      if (user?.role !== "admin") return;
      try {
        const params = {
          // Use the single dateRange state
          startDate: format(dateRange.startDate, "yyyy-MM-dd"),
          endDate: format(dateRange.endDate, "yyyy-MM-dd"),
        };
        if (selectedUser !== "all") params.userId = selectedUser;

        const loginRes = await API.get("/admin/analytics", { params });
        const loginData = loginRes.data || [];
        const categories = loginData.map((item) => item.date);
        const logins = loginData.map((item) => item.logins);
        const failedLogins = loginData.map((item) => item.failedLogins);

        setLoginChartOptions((prev) => ({ ...prev, xaxis: { categories } }));
        setLoginChartData([
          { name: "Logins", data: logins },
          { name: "Failed Logins", data: failedLogins },
        ]);
      } catch (err) {
        console.error("Failed to fetch login analytics", err);
      }
    };
    fetchLoginAnalytics();
    // --- 2. UPDATED DEPENDENCIES ---
  }, [user, dateRange, selectedUser]); // Depends on the single dateRange state

  // --- Fetch Page Views Analytics ---
  useEffect(() => {
    const fetchPageAnalytics = async () => {
      if (user?.role !== "admin") return;
      try {
        const params = {
           // Use the single dateRange state
          startDate: format(dateRange.startDate, "yyyy-MM-dd"),
          endDate: format(dateRange.endDate, "yyyy-MM-dd"),
        };
        if (selectedUser !== "all") params.userId = selectedUser;

        const pageRes = await API.get("/admin/analytics/pageviews", { params });
        const pageData = pageRes.data || [];

        const pageCats = pageData.map((item) => {
          const parts = item.page.split("/").filter(Boolean);
          return parts.length > 0 ? parts[parts.length - 1] : "Home";
        });
        const users = pageData.map((item) => item.users);

        setPageChartOptions((prev) => ({ ...prev, xaxis: { categories: pageCats } }));
        setPageChartData([{ name: "Users per Page", data: users }]);
      } catch (err) {
        console.error("Failed to fetch page analytics", err);
      }
    };
    fetchPageAnalytics();
    // --- 2. UPDATED DEPENDENCIES ---
  }, [user, dateRange, selectedUser]); // Depends on the single dateRange state

  if (user?.role !== "admin") {
    return <p className="text-red-500 font-bold">Access denied. Admins only.</p>;
  }

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Admin Analytics Dashboard</h2>

        {/* --- 3. MOVED GLOBAL FILTERS TO THE TOP --- */}
        <div className="mb-6 flex items-center gap-4 p-4 border rounded-lg bg-gray-50">
          <div>
            <label className="block mb-1 text-sm font-semibold">Filter by User:</label>
            <select
              value={selectedUser}
              onChange={(e) => setSelectedUser(e.target.value)}
              className="border px-2 py-2 rounded"
            >
              <option value="all">All Users</option>
              {allUsers.map((u) => (
                <option key={u._id} value={u._id}>
                  {u.firstName}, {u.lastName}, {u.email}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block mb-1 text-sm font-semibold">Filter by Date:</label>
            <DatePicker
              appliedStartDate={dateRange.startDate}
              appliedEndDate={dateRange.endDate}
              onApply={(newStart, newEnd) =>
                setDateRange({ startDate: newStart, endDate: newEnd })
              }
            />
          </div>
        </div>

        {/* --- Logins Chart --- */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-2">Logins vs Failed Logins</h3>
          {/* DatePicker removed from here */}
          <ReactApexChart
            options={loginChartOptions}
            series={loginChartData}
            type="bar"
            height={350}
          />
        </div>

        {/* --- Page Views Chart --- */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Page Views per Page</h3>
          {/* DatePicker removed from here */}
          <ReactApexChart
            options={pageChartOptions}
            series={pageChartData}
            type="bar"
            height={350}
          />
        </div>
      </div>
    </>
  );
};

export default AdminAnalytics;