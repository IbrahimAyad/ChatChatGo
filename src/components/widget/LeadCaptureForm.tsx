'use client';

import React, { useState } from 'react';
import { motion } from 'framer-motion';
import { X, User, Mail, Phone, Building, MessageSquare } from 'lucide-react';
import { WidgetConfig } from '@/types';

interface LeadCaptureFormProps {
  onSubmit: (leadData: LeadFormData) => void;
  onClose: () => void;
  config: WidgetConfig;
}

export interface LeadFormData {
  name?: string;
  email?: string;
  phone?: string;
  company?: string;
  message?: string;
}

export function LeadCaptureForm({ onSubmit, onClose, config }: LeadCaptureFormProps) {
  const [formData, setFormData] = useState<LeadFormData>({
    name: '',
    email: '',
    phone: '',
    company: '',
    message: '',
  });
  
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [errors, setErrors] = useState<Partial<LeadFormData>>({});

  const validateForm = (): boolean => {
    const newErrors: Partial<LeadFormData> = {};

    // Required field validation based on config
    if (config.behavior.requireName && !formData.name?.trim()) {
      newErrors.name = 'Name is required';
    }

    if (config.behavior.requireEmail && !formData.email?.trim()) {
      newErrors.email = 'Email is required';
    } else if (formData.email && !isValidEmail(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
    }

    if (config.behavior.requirePhone && !formData.phone?.trim()) {
      newErrors.phone = 'Phone number is required';
    }

    // At least email or phone should be provided
    if (!formData.email?.trim() && !formData.phone?.trim()) {
      const errorMessage = 'Please provide either an email address or phone number';
      if (!newErrors.email) newErrors.email = errorMessage;
      if (!newErrors.phone) newErrors.phone = errorMessage;
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const isValidEmail = (email: string): boolean => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    return emailRegex.test(email);
  };

  const handleInputChange = (field: keyof LeadFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) return;

    setIsSubmitting(true);

    try {
      // Submit lead data via API
      const response = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...formData,
          botId: config.botId,
          tenantId: config.tenantId,
          source: 'chat_widget',
          timestamp: new Date().toISOString(),
        }),
      });

      if (!response.ok) throw new Error('Failed to submit lead');

      onSubmit(formData);
    } catch (error) {
      console.error('Lead submission error:', error);
      // Could show error toast here
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50"
      onClick={(e) => e.target === e.currentTarget && onClose()}
    >
      <motion.div
        initial={{ scale: 0.9, y: 20 }}
        animate={{ scale: 1, y: 0 }}
        exit={{ scale: 0.9, y: 20 }}
        className="bg-white rounded-lg shadow-xl w-full max-w-md mx-4 overflow-hidden"
      >
        {/* Header */}
        <div 
          className="px-6 py-4 border-b flex items-center justify-between"
          style={{ backgroundColor: config.appearance.colors?.primary || '#0ea5e9' }}
        >
          <h3 className="text-lg font-semibold text-white">
            Let's Stay Connected
          </h3>
          <button
            onClick={onClose}
            className="text-white hover:bg-white/20 rounded-full p-1 transition-colors"
          >
            <X size={20} />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="p-6 space-y-4">
          <p className="text-gray-600 text-sm mb-4">
            We'd love to help you further! Please share your contact information and we'll get back to you soon.
          </p>

          {/* Name field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Full Name {config.behavior.requireName && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <User size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.name || ''}
                onChange={(e) => handleInputChange('name', e.target.value)}
                placeholder="Enter your full name"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.name ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.name && <p className="text-red-500 text-xs mt-1">{errors.name}</p>}
          </div>

          {/* Email field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Email Address {config.behavior.requireEmail && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <Mail size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="email"
                value={formData.email || ''}
                onChange={(e) => handleInputChange('email', e.target.value)}
                placeholder="Enter your email address"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.email ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.email && <p className="text-red-500 text-xs mt-1">{errors.email}</p>}
          </div>

          {/* Phone field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Phone Number {config.behavior.requirePhone && <span className="text-red-500">*</span>}
            </label>
            <div className="relative">
              <Phone size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="tel"
                value={formData.phone || ''}
                onChange={(e) => handleInputChange('phone', e.target.value)}
                placeholder="Enter your phone number"
                className={`w-full pl-10 pr-3 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 ${
                  errors.phone ? 'border-red-500' : 'border-gray-300'
                }`}
              />
            </div>
            {errors.phone && <p className="text-red-500 text-xs mt-1">{errors.phone}</p>}
          </div>

          {/* Company field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Company (Optional)
            </label>
            <div className="relative">
              <Building size={16} className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400" />
              <input
                type="text"
                value={formData.company || ''}
                onChange={(e) => handleInputChange('company', e.target.value)}
                placeholder="Enter your company name"
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
              />
            </div>
          </div>

          {/* Message field */}
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">
              Additional Message (Optional)
            </label>
            <div className="relative">
              <MessageSquare size={16} className="absolute left-3 top-3 text-gray-400" />
              <textarea
                value={formData.message || ''}
                onChange={(e) => handleInputChange('message', e.target.value)}
                placeholder="Anything else you'd like us to know?"
                rows={3}
                className="w-full pl-10 pr-3 py-2 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500 resize-none"
              />
            </div>
          </div>

          {/* Submit button */}
          <div className="flex space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="flex-1 px-4 py-2 text-gray-600 border border-gray-300 rounded-lg hover:bg-gray-50 transition-colors"
              disabled={isSubmitting}
            >
              Maybe Later
            </button>
            <button
              type="submit"
              disabled={isSubmitting}
              className="flex-1 px-4 py-2 bg-blue-500 text-white rounded-lg hover:bg-blue-600 disabled:opacity-50 disabled:cursor-not-allowed transition-colors"
              style={{ backgroundColor: config.appearance.colors?.primary || '#0ea5e9' }}
            >
              {isSubmitting ? 'Submitting...' : 'Submit'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
} 