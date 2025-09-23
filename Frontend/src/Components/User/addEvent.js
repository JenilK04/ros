import React, { useState, useEffect } from 'react';
import { X, Calendar, MapPin, Image as ImageIcon, Users } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import API from '../../services/api.js'// Adjust the import path as necessary

const AddEventModal = ({ isOpen, onClose, onEventAdded, editEvent }) => {
  const initialFormData = {
    title: '',
    description: '',
    date: '',
    category: '',
    targetAudience: '',
    location: '',
    images: [],
    imagePreviews: []
  };

  const [formData, setFormData] = useState(initialFormData);
  const [formErrors, setFormErrors] = useState({});
  const [isLoading, setIsLoading] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  useEffect(() => {
    if (!isOpen) return;

    setFormData({
      ...initialFormData,
      ...editEvent,
      imagePreviews: editEvent?.images || []
    });
    setFormErrors({});
    setIsLoading(false);
  }, [isOpen, editEvent]);

  if (!isOpen) return null;

  const handleClose = () => {
    if (isLoading) return;
    setFormData(initialFormData);
    setFormErrors({});
    onClose();
  };

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prev) => ({ ...prev, [name]: value }));
    if (formErrors[name]) setFormErrors((prev) => ({ ...prev, [name]: '' }));
  };

  const handleImageChange = (e) => {
    const files = Array.from(e.target.files);
    const newPreviews = [];

    files.forEach((file) => {
      const reader = new FileReader();
      reader.onloadend = () => {
        newPreviews.push(reader.result);
        if (newPreviews.length === files.length) {
          setFormData((prev) => ({
            ...prev,
            images: [...prev.images, ...newPreviews],
            imagePreviews: [...prev.imagePreviews, ...newPreviews]
          }));
        }
      };
      reader.readAsDataURL(file);
    });

    if (formErrors.images) setFormErrors((prev) => ({ ...prev, images: '' }));
  };

  const handleRemoveImage = (index) => {
    setFormData((prev) => ({
      ...prev,
      images: prev.images.filter((_, i) => i !== index),
      imagePreviews: prev.imagePreviews.filter((_, i) => i !== index)
    }));
  };

  const handleDrag = (e) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === 'dragenter' || e.type === 'dragover') setDragActive(true);
    if (e.type === 'dragleave') setDragActive(false);
  };

  const handleDrop = (e) => {
    e.preventDefault();
    e.stopPropagation();
    setDragActive(false);
    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const files = Array.from(e.dataTransfer.files);
      const newPreviews = [];
      files.forEach((file) => {
        const reader = new FileReader();
        reader.onloadend = () => {
          newPreviews.push(reader.result);
          if (newPreviews.length === files.length) {
            setFormData((prev) => ({
              ...prev,
              images: [...prev.images, ...newPreviews],
              imagePreviews: [...prev.imagePreviews, ...newPreviews]
            }));
          }
        };
        reader.readAsDataURL(file);
      });
      e.dataTransfer.clearData();
    }
  };

  const validateForm = () => {
    const errors = {};
    if (!formData.title.trim()) errors.title = 'Event title is required';
    if (!formData.date) errors.date = 'Event date is required';
    if (!formData.category.trim()) errors.category = 'Category is required';
    if (!formData.location.trim()) errors.location = 'Location is required';
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (!validateForm()) return;

    setIsLoading(true);
    try {
      // Axios automatically handles JSON.stringify for us
      const response = await API.post('/events', formData, {
        headers: { 'Content-Type': 'application/json' },
      });

      if (response.data && response.data.event) {
        onEventAdded(response.data.event);
        handleClose();
      } else {
        console.error(response.data?.message || "Unknown error");
      }
    } catch (err) {
      console.error("Error submitting event:", err);
    }
    setIsLoading(false);
  };

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 bg-gray-900 bg-opacity-75 flex items-center justify-center p-4 z-50"
        >
          <motion.div
            initial={{ scale: 0.9 }}
            animate={{ scale: 1 }}
            exit={{ scale: 0.9 }}
            className="bg-white rounded-3xl shadow-2xl w-full max-w-3xl max-h-[90vh] overflow-y-auto relative"
          >
            {/* Loading Overlay */}
            {isLoading && (
              <div className="absolute inset-0 bg-white/80 z-50 flex items-center justify-center rounded-3xl">
                <div className="loader ease-linear rounded-full border-8 border-t-8 border-gray-200 h-20 w-20 animate-spin"></div>
              </div>
            )}

            {/* Modal Header */}
            <div className="flex justify-between items-center p-6 border-b border-gray-100">
              <h2 className="text-3xl font-bold text-gray-800 tracking-tight">
                {editEvent ? 'Edit Event' : 'Add New Event'}
              </h2>
              <button
                onClick={handleClose}
                className="text-gray-400 hover:text-gray-600 transition-colors p-2 rounded-full hover:bg-gray-100"
              >
                <X className="h-6 w-6" />
              </button>
            </div>

            {/* Modal Form */}
            <form onSubmit={handleSubmit} className="p-8 space-y-8">
              {/* Event Details */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <Users className="h-6 w-6 text-indigo-500" /> Event Details
                </h3>

                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  {/* Title */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Title <span className="text-red-500">*</span>
                    </label>
                    <input
                      type="text"
                      name="title"
                      value={formData.title}
                      onChange={handleChange}
                      placeholder="Enter event title"
                      className={`mt-1 block w-full border ${formErrors.title ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                    />
                    {formErrors.title && <p className="text-red-500 text-xs mt-1">{formErrors.title}</p>}
                  </div>

                  {/* Date */}
                  <div className="relative">
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Event Date <span className="text-red-500">*</span>
                    </label>
                    <Calendar className="absolute top-10 left-3 h-5 w-5 text-gray-400" />
                    <input
                      type="date"
                      name="date"
                      value={formData.date}
                      onChange={handleChange}
                      placeholder="Select event date"
                      className={`pl-10 mt-1 block w-full border ${formErrors.date ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                    />
                    {formErrors.date && <p className="text-red-500 text-xs mt-1">{formErrors.date}</p>}
                  </div>

                  {/* Category */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">
                      Category <span className="text-red-500">*</span>
                    </label>
                    <select
                      name="category"
                      value={formData.category}
                      onChange={handleChange}
                      className={`mt-1 block w-full border ${formErrors.category ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                    >
                      <option value="">Select category</option>
                      <option value="Project Launch">Project Launch</option>
                      <option value="Open House">Open House</option>
                      <option value="Community Meetup">Community Meetup</option>
                      <option value="Seminar">Seminar</option>
                      <option value="Promotional Event">Promotional Event</option>
                    </select>
                    {formErrors.category && <p className="text-red-500 text-xs mt-1">{formErrors.category}</p>}
                  </div>

                  {/* Target Audience */}
                  <div>
                    <label className="block text-sm font-medium text-gray-700 mb-1">Target Audience</label>
                    <input
                      type="text"
                      name="targetAudience"
                      value={formData.targetAudience}
                      onChange={handleChange}
                      placeholder="E.g., Investors, Residents"
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors"
                    />
                  </div>

                  {/* Location */}
                  <div className="col-span-1 md:col-span-2 relative">
                    <MapPin className="absolute top-3 left-3 h-5 w-5 text-gray-400" />
                    <input
                      type="text"
                      name="location"
                      value={formData.location}
                      onChange={handleChange}
                      placeholder="Enter event location"
                      className={`pl-10 mt-1 block w-full border ${formErrors.location ? 'border-red-500' : 'border-gray-300'} rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 transition-colors`}
                    />
                    {formErrors.location && <p className="text-red-500 text-xs mt-1">{formErrors.location}</p>}
                  </div>

                  {/* Description */}
                  <div className="col-span-1 md:col-span-2">
                    <label className="block text-sm font-medium text-gray-700 mb-1">Description</label>
                    <textarea
                      name="description"
                      value={formData.description}
                      onChange={handleChange}
                      placeholder="Write a brief description about the event"
                      rows="4"
                      className="mt-1 block w-full border border-gray-300 rounded-lg shadow-sm p-3 focus:outline-none focus:ring-2 focus:ring-indigo-500 resize-none transition-colors"
                    />
                  </div>
                </div>
              </div>

              {/* Image Upload */}
              <div className="space-y-4">
                <h3 className="text-xl font-semibold text-gray-800 flex items-center gap-2">
                  <ImageIcon className="h-6 w-6 text-red-500" /> Event Images
                </h3>
                <div
                  className={`relative border-2 border-dashed rounded-lg p-6 text-center cursor-pointer transition-colors ${dragActive ? 'border-blue-500 bg-blue-50' : 'border-gray-300 bg-white'}`}
                  onDragEnter={handleDrag}
                  onDragLeave={handleDrag}
                  onDragOver={handleDrag}
                  onDrop={handleDrop}
                >
                  <input
                    type="file"
                    multiple
                    accept="image/*"
                    onChange={handleImageChange}
                    className="absolute inset-0 w-full h-full opacity-0 cursor-pointer"
                  />
                  <div className="flex flex-col items-center justify-center space-y-2">
                    <ImageIcon className="h-8 w-8 text-gray-400" />
                    <p className="text-gray-500 text-sm">Drag & drop or click to upload images</p>
                  </div>
                </div>

                {formData.imagePreviews.length > 0 && (
                  <div className="mt-4 grid grid-cols-2 md:grid-cols-4 gap-4">
                    {formData.imagePreviews.map((src, i) => (
                      <div key={i} className="relative w-full h-32 rounded-lg shadow-lg overflow-hidden group">
                        <img
                          src={src}
                          alt={`preview-${i}`}
                          className="w-full h-full object-cover transform group-hover:scale-105 transition-transform duration-300"
                        />
                        <button
                          type="button"
                          onClick={() => handleRemoveImage(i)}
                          className="absolute top-1 right-1 bg-red-600 text-white rounded-full p-1 opacity-0 group-hover:opacity-100 transition-opacity duration-300"
                        >
                          <X className="h-4 w-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              {/* Buttons */}
              <div className="flex justify-end gap-3 pt-4 border-t border-gray-100">
                <button
                  type="button"
                  onClick={handleClose}
                  disabled={isLoading}
                  className="px-6 py-2.5 text-gray-700 rounded-full font-semibold border border-gray-300 hover:bg-gray-100 transition disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Cancel
                </button>
                <button
                  type="submit"
                  disabled={isLoading}
                  className="px-8 py-2.5 bg-gradient-to-r from-indigo-500 to-blue-600 text-white rounded-full font-bold shadow-lg hover:from-indigo-600 hover:to-blue-700 transition transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isLoading ? 'Processing...' : editEvent ? 'Update Event' : 'Add Event'}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddEventModal;
