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

// --- Reusable DatePicker Component ---
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

// --- AdminAnalytics Component ---
const AdminAnalytics = () => {
  const { user } = useUser();

  const [allProperties, setAllProperties] = useState([]);
  const [allProjects, setAllProjects] = useState([]);

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

  const [propertyChartData, setPropertyChartData] = useState([]);
  const [propertyChartOptions, setPropertyChartOptions] = useState({
    chart: { id: "property-bar", toolbar: { show: true } },
    xaxis: { categories: [] },
  });

  const [projectChartData, setProjectChartData] = useState([]);
  const [projectChartOptions, setProjectChartOptions] = useState({
    chart: { id: "project-bar", toolbar: { show: true } },
    xaxis: { categories: [] },
  });

  // --- Global Filters ---
  const [allUsers, setAllUsers] = useState([]);
  const [selectedUser, setSelectedUser] = useState("all");
  const [dateRange, setDateRange] = useState({
    startDate: new Date(),
    endDate: new Date(),
  });

  // Fetch users
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
  // Fetch properties
  useEffect(() => {
    const fetchProperties = async () => {
      try {
        const res = await API.get("/properties");
        setAllProperties(res.data || []);
      } catch (err) {
        console.error("Failed to fetch properties", err);
      }
    };
    fetchProperties();
  }, []);

  // Fetch projects
  useEffect(() => {
    const fetchProjects = async () => {
      try {
        const res = await API.get("/projects");
        setAllProjects(res.data || []);
      } catch (err) {
        console.error("Failed to fetch projects", err);
      }
    };
    fetchProjects();
  }, []);

  // --- Fetch Login Analytics ---
  useEffect(() => {
    const fetchLoginAnalytics = async () => {
      if (user?.role !== "admin") return;
      try {
        const params = {
          startDate: format(dateRange.startDate, "yyyy-MM-dd"),
          endDate: format(dateRange.endDate, "yyyy-MM-dd"),
        };
        if (selectedUser !== "all") params.userId = selectedUser;

        const res = await API.get("/analytics", { params });
        const loginData = res.data || [];

        const categories = loginData.map((item) => item.date || "Unknown");
        const logins = loginData.map((item) => item.logins || 0);
        const failedLogins = loginData.map((item) => item.failedLogins || 0);

        setLoginChartOptions((prev) => ({
          ...prev,
          xaxis: { categories },
        }));
        setLoginChartData([
          { name: "Logins", data: logins },
          { name: "Failed Logins", data: failedLogins },
        ]);
      } catch (err) {
        console.error("Failed to fetch login analytics", err);
      }
    };
    fetchLoginAnalytics();
  }, [user, dateRange, selectedUser]);

  // --- Fetch Page Views Analytics ---
  useEffect(() => {
    const fetchPageAnalytics = async () => {
      if (user?.role !== "admin") return;
      try {
        const params = {
          startDate: format(dateRange.startDate, "yyyy-MM-dd"),
          endDate: format(dateRange.endDate, "yyyy-MM-dd"),
        };
        if (selectedUser !== "all") params.userId = selectedUser;

        const res = await API.get("/analytics/pageviews", { params });
        const pageData = res.data || [];

        const filteredPages = pageData.filter((item) => {
          let pathname;
          try {
            pathname = new URL(item.page).pathname;
          } catch {
            pathname = item.page || "/";
          }

          // ✅ Exclude property detail pages
          if (pathname.startsWith("/properties/") && pathname !== "/properties") return false;

          // ✅ Exclude project detail pages
          if (pathname.startsWith("/projects/") && pathname !== "/projects") return false;

          return true;
        });

        const pageCats = filteredPages.map((item) => {
          const parts = (item.page || "").split("/").filter(Boolean);
          return parts.length > 0 ? parts[parts.length - 1] : "Home";
        });
        const users = filteredPages.map((item) => item.users || 0);

        setPageChartOptions((prev) => ({
          ...prev,
          xaxis: { categories: pageCats },
        }));
        setPageChartData([{ name: "Users per Page", data: users }]);
      } catch (err) {
        console.error("Failed to fetch page analytics", err);
      }
    };
    fetchPageAnalytics();
  }, [user, dateRange, selectedUser]);

  // --- Fetch Property Analytics ---
  useEffect(() => {
    const fetchPropertyAnalytics = async () => {
      if (user?.role !== "admin") return;
      if (!allProperties || allProperties.length === 0) return; // wait until properties are fetched

      try {
        const params = {
          startDate: format(dateRange.startDate, "yyyy-MM-dd"),
          endDate: format(dateRange.endDate, "yyyy-MM-dd"),
        };
        if (selectedUser !== "all") params.userId = selectedUser;

        const pageRes = await API.get("/analytics/pageviews", { params });
        const pageData = pageRes.data || [];

        // Filter only property pages
        const propertyPages = pageData.filter((item) => {
          let pathname;
          try {
            pathname = new URL(item.page).pathname;
          } catch {
            pathname = item.page.startsWith("/") ? item.page : `/${item.page}`;
          }
          return pathname.startsWith("/properties/") && pathname.split("/").length > 2;
        });

        // Aggregate users per property ID
        const propertyUsersMap = {};
        propertyPages.forEach((item) => {
          let pathname;
          try {
            pathname = new URL(item.page).pathname;
          } catch {
            pathname = item.page.startsWith("/") ? item.page : `/${item.page}`;
          }
          const parts = pathname.split("/").filter(Boolean);
          const propertyId = parts[1];
          if (!propertyId) return; // skip if invalid
          propertyUsersMap[propertyId] = (propertyUsersMap[propertyId] || 0) + (item.users || 0);
        });

        const propertyIds = Object.keys(propertyUsersMap);

        // Safely map IDs to names and counts
        const safePropertyNames = propertyIds.map((id) => {
          const prop = allProperties.find((p) => p._id === id);
          return prop?.name || id; // fallback to id if name missing
        });
        const safeUsersCount = propertyIds.map((id) => propertyUsersMap[id] || 0); // fallback 0

        // Only set chart if arrays are valid
        if (safePropertyNames.length === safeUsersCount.length && safePropertyNames.length > 0) {
          setPropertyChartOptions({
            chart: { id: "property-bar", toolbar: { show: true } },
            xaxis: { categories: safePropertyNames },
            tooltip: {
              custom: ({ series, seriesIndex, dataPointIndex }) => {
                const propertyId = propertyIds[dataPointIndex];
                const prop = allProperties.find((p) => p._id === propertyId);
                if (!prop) return `${propertyId}: ${series[seriesIndex][dataPointIndex]}`;
                return `
                  <div style="padding:5px">
                    <b>${prop.title}</b><br/>
                    Type: ${prop.propertyType || "-"}<br/>
                    Location: ${prop.address.street || "-"},
                     ${prop.address.city || "-"},
                     ${prop.address.state || "-"}, 
                     ${prop.address.zip || "-"}<br/>
                    Price: ${prop.price || "-"}
                  </div>
                `;
              },
            },
          });

          setPropertyChartData([{ name: "Users per Property", data: safeUsersCount }]);
        } else {
          // fallback empty chart to prevent errors
          setPropertyChartOptions({
            chart: { id: "property-bar", toolbar: { show: true } },
            xaxis: { categories: [] },
          });
          setPropertyChartData([{ name: "Users per Property", data: [] }]);
        }
      } catch (err) {
        console.error("Failed to fetch property analytics", err);
        // fallback empty chart on error
        setPropertyChartOptions({
          chart: { id: "property-bar", toolbar: { show: true } },
          xaxis: { categories: [] },
        });
        setPropertyChartData([{ name: "Users per Property", data: [] }]);
      }
    };
    fetchPropertyAnalytics();
  }, [user, dateRange, selectedUser, allProperties]);

  useEffect(() => {
  const fetchProjectAnalytics = async () => {
    if (user?.role !== "admin") return;
    if (!allProjects || allProjects.length === 0) return; // wait until projects are fetched

    try {
      const params = {
        startDate: format(dateRange.startDate, "yyyy-MM-dd"),
        endDate: format(dateRange.endDate, "yyyy-MM-dd"),
      };
      if (selectedUser !== "all") params.userId = selectedUser;

      const pageRes = await API.get("/analytics/pageviews", { params });
      const pageData = pageRes.data || [];

      // 1️⃣ Filter only project detail pages (/projects/:id)
      const projectPages = pageData.filter((item) => {
        let pathname;
        try {
          pathname = new URL(item.page).pathname;
        } catch {
          pathname = item.page.startsWith("/") ? item.page : `/${item.page}`;
        }
        return pathname.startsWith("/projects/") && pathname.split("/").length > 2;
      });

      // 2️⃣ Aggregate users per project ID
      const projectUsersMap = {};
      projectPages.forEach((item) => {
        let pathname;
        try {
          pathname = new URL(item.page).pathname;
        } catch {
          pathname = item.page.startsWith("/") ? item.page : `/${item.page}`;
        }
        const parts = pathname.split("/").filter(Boolean);
        const projectId = parts[1];
        if (!projectId) return;
        projectUsersMap[projectId] = (projectUsersMap[projectId] || 0) + (item.users || 0);
      });

      const projectIds = Object.keys(projectUsersMap);

      // 3️⃣ Safely map IDs to project names and counts
      const safeProjectNames = projectIds.map((id) => {
        const proj = allProjects.find((p) => p._id === id);
        return proj?.name || id; // fallback if name missing
      });
      const safeUsersCount = projectIds.map((id) => projectUsersMap[id] || 0);

      // 4️⃣ Set chart data if valid
      if (safeProjectNames.length === safeUsersCount.length && safeProjectNames.length > 0) {
        setProjectChartOptions({
          chart: { id: "project-bar", toolbar: { show: true } },
          xaxis: { categories: safeProjectNames },
          tooltip: {
            custom: ({ series, seriesIndex, dataPointIndex }) => {
              const projectId = projectIds[dataPointIndex];
              const proj = allProjects.find((p) => p._id === projectId);
              if (!proj) return `${projectId}: ${series[seriesIndex][dataPointIndex]}`;
              return `
                <div style="padding:5px">
                  <b>${proj.ProjectName}</b><br/>
                  Developer: ${proj.DeveloperName || "-"}<br/>
                  Type: ${proj.ProjectType || "-"}<br/>    
                  Location: ${proj.address?.street +","+proj.address?.city+","+proj.address?.state  || "-"}, ${proj.address?.state || "-"}<br/>
                </div>
              `;
            },
          },
        });

        setProjectChartData([{ name: "Users per Project", data: safeUsersCount }]);
      } else {
        setProjectChartOptions({
          chart: { id: "project-bar", toolbar: { show: true } },
          xaxis: { categories: [] },
        });
        setProjectChartData([{ name: "Users per Project", data: [] }]);
      }
    } catch (err) {
      console.error("Failed to fetch project analytics", err);
      setProjectChartOptions({
        chart: { id: "project-bar", toolbar: { show: true } },
        xaxis: { categories: [] },
      });
      setProjectChartData([{ name: "Users per Project", data: [] }]);
    }
  };

  fetchProjectAnalytics();
}, [user, dateRange, selectedUser, allProjects]);

  if (user?.role !== "admin") {
    return <p className="text-red-500 font-bold">Access denied. Admins only.</p>;
  }

  return (
    <>
      <Navbar />
      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Admin Analytics Dashboard</h2>

        {/* --- Global Filters --- */}
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

        {/* --- Charts --- */}
        <div className="mb-10 bg-white p-5 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-2">Logins vs Failed Logins</h3>
          {loginChartData.length && loginChartOptions.xaxis.categories.length > 0 ? (
            <ReactApexChart options={loginChartOptions} series={loginChartData} type="bar" height={350} />
          ) : (
            <p>No login data available</p>
          )}
        </div>

        <div className="mb-10 bg-white p-5 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-2">Page Views per Page</h3>
          {pageChartData.length && pageChartOptions.xaxis.categories.length > 0 ? (
            <ReactApexChart options={pageChartOptions} series={pageChartData} type="bar" height={350} />
          ) : (
            <p>No page data available</p>
          )}
        </div>

        <div className="mt-10 bg-white p-5 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-2">Property Pages Views</h3>
          {propertyChartData.length && propertyChartOptions.xaxis.categories.length > 0 ? (
            <ReactApexChart options={propertyChartOptions} series={propertyChartData} type="bar" height={350} />
          ) : (
            <p>No property data available</p>
          )}
        </div>

        <div className="mt-10 bg-white p-5 rounded-xl shadow">
          <h3 className="text-xl font-semibold mb-2">Project Pages Views</h3>
          {projectChartData.length && projectChartOptions.xaxis.categories.length > 0 ? (
            <ReactApexChart
              options={projectChartOptions}
              series={projectChartData}
              type="bar"
              height={350}
            />
          ) : (
            <p className="text-gray-500">No project data available</p>
          )}
        </div>
      </div>
    </>
  );
};

export default AdminAnalytics;
