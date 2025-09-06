import { Link } from "react-router-dom";
import {LogIn, UserPlus,Building } from "lucide-react";

const HomePage = () => {
  return (
    <div className="flex flex-col min-h-screen bg-gradient-to-br from-blue-50 via-white to-green-50">
      
      {/* Navbar */}
      <nav className="flex justify-between items-center px-8 py-4 shadow-md bg-white sticky top-0 z-50">
        <h1 className="text-2xl font-bold text-blue-700">
          <Building className="inline-block h-8 w-8 mr-2" />
          ROS-Real Estate Ecosystem
        </h1>
        <div className="flex gap-4">
          <Link
            to="/login"
            className="flex items-center gap-2 px-5 py-2 rounded-lg border border-blue-600 text-blue-600 font-medium hover:bg-blue-50 transition"
          >
            <LogIn className="h-5 w-5" /> Sign In
          </Link>
          <Link
            to="/registration"
            className="flex items-center gap-2 px-5 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
          >
            <UserPlus className="h-5 w-5" /> Sign Up
          </Link>
        </div>
      </nav>

      {/* Hero Section */}
      <header className="px-6 py-12 text-center">
        <h2 className="text-4xl md:text-5xl font-extrabold mb-4 text-gray-800">
          Welcome to ROS Real Estate
        </h2>
        <p className="max-w-2xl mx-auto text-gray-600 mb-6">
          Your one-stop ecosystem for buying, selling, and managing properties. 
          Whether you are a Buyer, Seller, Developer, or Agent — we bring everyone together.
        </p>
        <div className="flex justify-center gap-4">
          <Link
            to="/login"
            className="px-6 py-3 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium shadow transition"
          >
            Explore Properties
          </Link>
          <Link
            to="/login"
            className="px-6 py-3 rounded-lg bg-white text-blue-700 border border-blue-600 font-medium shadow hover:bg-blue-50 transition"
          >
            Get Started
          </Link>
        </div>
      </header>

      {/* Info Sections (Card Style) */}
      <main className="px-6 py-12 max-w-6xl mx-auto grid grid-cols-1 md:grid-cols-3 gap-6">
        <Card
          title="Sell Your Property"
          description="List your property and connect directly with buyers. Manage inquiries and close deals faster."
          img="https://images.pexels.com/photos/106399/pexels-photo-106399.jpeg?auto=compress&cs=tinysrgb&w=1200"
          link="/login"
          linkText="Start Selling"
        />
        <Card
          title="Buy a Property"
          description="Browse verified listings, compare options, and make smarter decisions with trusted insights."
          img="https://images.pexels.com/photos/259588/pexels-photo-259588.jpeg?auto=compress&cs=tinysrgb&w=1200"
          link="/login"
          linkText="Start Buying"
        />
        <Card
          title="For Developers & Agents"
          description="Showcase projects, gain visibility, and connect with genuine clients to grow your business."
          img="https://images.pexels.com/photos/3184307/pexels-photo-3184307.jpeg?auto=compress&cs=tinysrgb&w=1200"
          link="/login"
          linkText="Join Now"
        />
      </main>

      {/* Why Choose Us Section */}
      <section className="px-6 py-12 max-w-6xl mx-auto">
        <div className="bg-white rounded-xl shadow p-8 text-center">
          <h3 className="text-2xl font-bold text-gray-800 mb-4">Why Choose ROS?</h3>
          <p className="text-gray-600 max-w-3xl mx-auto mb-6">
            We make real estate simple, transparent, and beneficial for everyone.
            Our platform ensures secure transactions, trusted listings, and tools that empower you.
          </p>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <FeatureCard title="Trusted Listings" desc="Every property is verified for transparency." />
            <FeatureCard title="Fast Deals" desc="Connect directly, no unnecessary delays." />
            <FeatureCard title="All-in-One" desc="Buy, sell, and manage in one ecosystem." />
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-white text-center py-6 mt-12 border-t">
        <p className="text-sm text-gray-600">
          © {new Date().getFullYear()} ROS Real Estate Ecosystem. All rights reserved.
        </p>
      </footer>
    </div>
  );
};

// Card with image
const Card = ({ title, description, img, link, linkText }) => (
  <div className="bg-white rounded-xl shadow hover:shadow-lg transition cursor-pointer overflow-hidden">
    <img src={img} alt={title} className="w-full h-48 object-cover" />
    <div className="p-6">
      <h2 className="text-xl font-semibold text-gray-700 mb-2">{title}</h2>
      <p className="text-gray-600 mb-4">{description}</p>
      <Link
        to={link}
        className="px-4 py-2 rounded-lg bg-blue-600 hover:bg-blue-700 text-white font-medium transition"
      >
        {linkText}
      </Link>
    </div>
  </div>
);

// Feature cards
const FeatureCard = ({ title, desc }) => (
  <div className="p-4 bg-gradient-to-br from-blue-50 via-white to-green-50 rounded-xl shadow">
    <h4 className="text-lg font-semibold text-gray-700 mb-2">{title}</h4>
    <p className="text-gray-600 text-sm">{desc}</p>
  </div>
);

export default HomePage;
