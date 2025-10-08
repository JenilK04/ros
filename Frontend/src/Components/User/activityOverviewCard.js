import React, { useEffect, useState } from "react";
import ReactApexChart from "react-apexcharts";
import API from "../../services/api";
import DatePicker from "../datePicker";
import { format } from "date-fns";
const{useUser} = require("../../Context/userContext");

const PropertyViewsChart = () => {
  const { user } = useUser();
  const [chartData, setChartData] = useState({ categories: [], series: [] });
  const [dateRange, setDateRange] = useState({ startDate: new Date(), endDate: new Date() });


  const [projectChartData, setProjectChartData] = useState([]);
  const [projectChartOptions, setProjectChartOptions] = useState({
    chart: { id: "project-bar", toolbar: { show: true } },
    xaxis: { categories: [] },
  });
  useEffect(() => {
    const fetchData = async () => {
      try {
        const params = {
          startDate: format(dateRange.startDate, "yyyy-MM-dd"),
          endDate: format(dateRange.endDate, "yyyy-MM-dd"),
        };

        const response = await API.get("analytics/propertyviews", { params });
        const data = response.data || [];

        // map property names and actual views
        const categories = data.map((item) => item.propertyName);
        const seriesData = data.map((item) => item.views || 0); // actual view count

        setChartData({
          categories,
          series: [{ name: "Property Views", data: seriesData }],
        });
      } catch (error) {
        console.error("Failed to load property stats:", error);
      }
    };

    fetchData();
  }, [dateRange]);

  useEffect(() => {
    const fetchProjectViews = async () => {
      try {
        const params = {
          startDate: dateRange.startDate.toISOString().split("T")[0],
          endDate: dateRange.endDate.toISOString().split("T")[0],
        };

        const res = await API.get("analytics/projectviews", { params });
        const projectData = res.data || [];

        const projectNames = projectData.map((p) => p.projectName);
        const views = projectData.map((p) => p.views);

        setProjectChartOptions({
          chart: { id: "project-bar", toolbar: { show: true } },
          xaxis: { categories: projectNames },
          tooltip: {
            y: {
              formatter: (val) => `${val} unique viewers`,
            },
          },
        });

        setProjectChartData([{ name: "Project Views", data: views }]);
      } catch (err) {
        console.error("Failed to fetch project view stats", err);
        setProjectChartOptions({
          chart: { id: "project-bar", toolbar: { show: true } },
          xaxis: { categories: [] },
        });
        setProjectChartData([{ name: "Project Views", data: [] }]);
      }
    };

    fetchProjectViews();
  }, [ dateRange]);


  const options = {
    chart: { type: "bar", toolbar: { show: false } },
    plotOptions: { bar: { borderRadius: 6, horizontal: false } },
    xaxis: { categories: chartData.categories, labels: { rotate: -45 } },
    yaxis: { title: { text: "Views" } },
    dataLabels: { enabled: true },
    colors: ["#3b82f6"],
  };

  return (
    <div className="bg-white shadow rounded-xl p-6">
      <div className="flex justify-between items-center mb-4">
        <h2 className="text-lg font-semibold">Property Views</h2>
        <DatePicker
          appliedStartDate={dateRange.startDate}
          appliedEndDate={dateRange.endDate}
          onApply={(start, end) => setDateRange({ startDate: start, endDate: end })}
        />
      </div>

      {chartData.series[0]?.data.length > 0 ? (
        <ReactApexChart options={options} series={chartData.series} type="bar" height={350} />
      ) : (
        <p className="text-gray-500">No views yet</p>
      )}

      {user?.userType === "developer" && (
      <div className="mt-10">
        <h2 className="text-lg font-semibold mb-2">Project Page Views</h2>
        {projectChartData.length && projectChartOptions.xaxis.categories.length > 0 ? (
          <ReactApexChart
            options={projectChartOptions}
            series={projectChartData}
            type="bar"
            height={350}
          />
        ) : (
          <p className="text-gray-500">No views yet</p>
        )}
      </div>
      )}
    </div> 
  );
};

export default PropertyViewsChart;
 