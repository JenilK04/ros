// src/Components/Admin/AdminAnalytics.jsx
import React, { useEffect, useState } from 'react';
import Navbar from '../User/navbar';
import ReactApexChart from 'react-apexcharts';
import API from '../../services/api';
import { useUser } from '../../Context/userContext';

const AdminAnalytics = () => {
  const { user } = useUser();

  // Login / Failed Login chart state
  const [loginChartData, setLoginChartData] = useState([]);
  const [loginChartOptions, setLoginChartOptions] = useState({
    chart: { id: 'login-bar', toolbar: { show: true }, animations: { enabled: true, easing: 'easeinout', speed: 800 } },
    xaxis: { categories: [] },
    tooltip: { enabled: true },
    legend: { position: 'top' },
    dataLabels: { enabled: true },
  });

  // Page Views chart state
  const [pageChartData, setPageChartData] = useState([]);
  const [pageChartOptions, setPageChartOptions] = useState({
    chart: { id: 'page-bar', toolbar: { show: true }, animations: { enabled: true, easing: 'easeinout', speed: 800 } },
    xaxis: { categories: [] },
    tooltip: { enabled: true },
    legend: { position: 'top' },
    dataLabels: { enabled: true },
  });

  useEffect(() => {
    if (user?.role === 'admin') {
      fetchLoginAnalytics();
      fetchPageAnalytics();
    }
  }, [user]);

  // Fetch logins / failed logins
  const fetchLoginAnalytics = async () => {
    try {
      const response = await API.get('/admin/analytics'); // your backend endpoint
      const data = response.data;

      const categories = data.map((item) => item.date);
      const logins = data.map((item) => item.logins);
      const failedLogins = data.map((item) => item.failedLogins);

      setLoginChartOptions((prev) => ({ ...prev, xaxis: { categories } }));
      setLoginChartData([
        { name: 'Logins', data: logins },
        { name: 'Failed Logins', data: failedLogins },
      ]);
    } catch (error) {
      console.error('Failed to fetch login analytics', error);
    }
  };

  // Fetch page views
  const fetchPageAnalytics = async () => {
  try {
    const response = await API.get('/admin/analytics/pageviews'); // backend endpoint for page views
    const data = response.data;

    // Extract only the last segment as page name
    const categories = data.map((item) => {
      const parts = item.page.split('/').filter(Boolean); // remove empty strings
      return parts.length > 0 ? parts[parts.length - 1] : 'Home'; // last segment or Home
    });

    const users = data.map((item) => item.users);

    setPageChartOptions((prev) => ({ ...prev, xaxis: { categories } }));
    setPageChartData([{ name: 'Users per Page', data: users }]);
  } catch (error) {
    console.error('Failed to fetch page analytics', error);
  }
};

  if (user?.role !== 'admin') {
    return <p className="text-red-500 font-bold">Access denied. Admins only.</p>;
  }

  return (
    <>
      <Navbar />

      <div className="p-6">
        <h2 className="text-2xl font-bold mb-4">Admin Analytics Dashboard</h2>

        {/* Login / Failed Logins Chart */}
        <div className="mb-10">
          <h3 className="text-xl font-semibold mb-2">Logins vs Failed Logins</h3>
          <ReactApexChart
            options={loginChartOptions}
            series={loginChartData}
            type="bar"
            height={350}
          />
        </div>

        {/* Page Views Chart */}
        <div>
          <h3 className="text-xl font-semibold mb-2">Page Views per Page</h3>
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
