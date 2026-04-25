import React from "react";
import {
  PieChart, Pie, Cell, Tooltip, Legend,
  BarChart, Bar, XAxis, YAxis, CartesianGrid
} from "recharts";

const Home = () => {

  // sample data (API ekin replace karanna puluwan)
  const pieData = [
    { name: "Bookings", value: 400 },
    { name: "Tickets", value: 300 },
    { name: "Facilities", value: 200 },
  ];

  const barData = [
    { name: "Jan", bookings: 30 },
    { name: "Feb", bookings: 45 },
    { name: "Mar", bookings: 60 },
    { name: "Apr", bookings: 20 },
  ];

  const COLORS = ["#0088FE", "#00C49F", "#FFBB28"];

  return (
    <div style={{ padding: "20px" }}>
      <h2>Admin Dashboard</h2>

      <div style={{ display: "flex", gap: "40px", flexWrap: "wrap" }}>
        
        {/* Pie Chart */}
        <div>
          <h3>System Overview</h3>
          <PieChart width={300} height={300}>
            <Pie
              data={pieData}
              cx="50%"
              cy="50%"
              outerRadius={100}
              dataKey="value"
              label
            >
              {pieData.map((entry, index) => (
                <Cell key={index} fill={COLORS[index % COLORS.length]} />
              ))}
            </Pie>
            <Tooltip />
            <Legend />
          </PieChart>
        </div>

        {/* Bar Chart */}
        <div>
          <h3>Monthly Bookings</h3>
          <BarChart width={400} height={300} data={barData}>
            <CartesianGrid strokeDasharray="3 3" />
            <XAxis dataKey="name" />
            <YAxis />
            <Tooltip />
            <Legend />
            <Bar dataKey="bookings" fill="#8884d8" />
          </BarChart>
        </div>

      </div>
    </div>
  );
};

export default Home;
