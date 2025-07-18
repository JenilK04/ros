import React from 'react'
import { Building } from 'lucide-react';

function Dashboard() {

  return (
    <nav className="bg-blue-600 text-white p-4 flex justify-between items-center">
      <div className="flex items-center space-x-2">
        <Building className="h-6 w-6" />
        <span className="font-bold">ROS Ecosystem</span>
      </div>
      <div className="space-x-4">
        <a href="/dashboard" className="hover:underline">Dashboard</a>
        <a href="/admin" className="hover:underline">Admin Panel</a>
        <button className="hover:underline text-red-200">Logout</button>
      </div>
    </nav>
  )
}

export default Dashboard