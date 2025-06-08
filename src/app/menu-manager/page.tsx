'use client';

import { useState, useEffect } from 'react';

interface StoredMenuData {
  restaurantName: string;
  menu: Array<{
    name: string;
    price?: string;
    description?: string;
    category?: string;
  }>;
  specialOffers?: string[];
  source: string;
  dataSource: 'scraped' | 'manual' | 'api';
  lastScraped: string;
  isStale: boolean;
  scrapingHistory: Array<{
    timestamp: string;
    source: string;
    success: boolean;
    itemsFound: number;
  }>;
}

export default function MenuManager() {
  const [tenantId, setTenantId] = useState('mario-restaurant');
  const [url, setUrl] = useState('');
  const [storedData, setStoredData] = useState<StoredMenuData | null>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  
  // Manual submission states
  const [activeTab, setActiveTab] = useState<'scrape' | 'upload' | 'manual'>('scrape');
  const [uploadFiles, setUploadFiles] = useState<FileList | null>(null);
  const [manualItems, setManualItems] = useState([
    { name: '', price: '', description: '', category: 'Main Course' }
  ]);
  const [submissionLoading, setSubmissionLoading] = useState(false);
  const [showFeeNotice, setShowFeeNotice] = useState(false);

  // Load stored data on component mount
  useEffect(() => {
    loadStoredData();
  }, [tenantId]);

  const loadStoredData = async () => {
    try {
      const response = await fetch(`/api/tenants/${tenantId}/menu-data`);
      const data = await response.json();
      
      if (data.success) {
        setStoredData(data.menuData);
        setError('');
      } else {
        setStoredData(null);
        setError('No stored data found');
      }
    } catch (err) {
      setError('Failed to load stored data');
      setStoredData(null);
    }
  };

  const scrapeAndStore = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');

    try {
      const response = await fetch(`/api/tenants/${tenantId}/menu-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url, forceRefresh: true }),
      });

      const data = await response.json();

      if (data.success) {
        setStoredData(data.menuData);
        setError('');
        alert(`Success! Scraped and stored ${data.metadata.itemsScraped} items`);
      } else {
        setError(data.error || 'Failed to scrape and store');
      }
    } catch (err) {
      setError('Network error');
    } finally {
      setLoading(false);
    }
  };

  const refreshData = async () => {
    if (!storedData?.source) {
      setError('No source URL to refresh from');
      return;
    }

    setLoading(true);
    try {
      const response = await fetch(`/api/tenants/${tenantId}/menu-data`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ url: storedData.source, forceRefresh: true }),
      });

      const data = await response.json();
      if (data.success) {
        setStoredData(data.menuData);
        alert('Data refreshed successfully!');
      }
    } catch (err) {
      setError('Failed to refresh data');
    } finally {
      setLoading(false);
    }
  };

  const deleteData = async () => {
    if (!confirm('Are you sure you want to delete the stored menu data?')) return;

    try {
      const response = await fetch(`/api/tenants/${tenantId}/menu-data`, {
        method: 'DELETE',
      });

      if (response.ok) {
        setStoredData(null);
        alert('Menu data deleted successfully');
      }
    } catch (err) {
      setError('Failed to delete data');
    }
  };

  const handleFileUpload = async () => {
    if (!uploadFiles || uploadFiles.length === 0) {
      setError('Please select files to upload');
      return;
    }

    setSubmissionLoading(true);
    setShowFeeNotice(true);

    try {
      const formData = new FormData();
      formData.append('tenantId', tenantId);
      formData.append('submissionType', 'file-upload');
      
      for (let i = 0; i < uploadFiles.length; i++) {
        formData.append('files', uploadFiles[i]);
      }

      const response = await fetch('/api/tenants/manual-menu-submission', {
        method: 'POST',
        body: formData,
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Files uploaded successfully! We will process your menu within 24-48 hours and notify you via email.');
        setUploadFiles(null);
        // Reset file input
        const fileInput = document.getElementById('file-upload') as HTMLInputElement;
        if (fileInput) fileInput.value = '';
      } else {
        setError(data.error || 'Upload failed');
      }
    } catch (err) {
      setError('Upload failed');
    } finally {
      setSubmissionLoading(false);
    }
  };

  const handleManualSubmission = async () => {
    const validItems = manualItems.filter(item => item.name.trim());
    
    if (validItems.length === 0) {
      setError('Please add at least one menu item');
      return;
    }

    setSubmissionLoading(true);
    setShowFeeNotice(true);

    try {
      const response = await fetch('/api/tenants/manual-menu-submission', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          tenantId,
          submissionType: 'manual-entry',
          menuItems: validItems,
        }),
      });

      const data = await response.json();

      if (data.success) {
        alert('✅ Menu items submitted successfully! Your menu has been saved and is now active.');
        // Reset manual items
        setManualItems([{ name: '', price: '', description: '', category: 'Main Course' }]);
        loadStoredData(); // Refresh to show new data
      } else {
        setError(data.error || 'Submission failed');
      }
    } catch (err) {
      setError('Submission failed');
    } finally {
      setSubmissionLoading(false);
    }
  };

  const addManualItem = () => {
    setManualItems([...manualItems, { name: '', price: '', description: '', category: 'Main Course' }]);
  };

  const updateManualItem = (index: number, field: string, value: string) => {
    const updated = [...manualItems];
    updated[index] = { ...updated[index], [field]: value };
    setManualItems(updated);
  };

  const removeManualItem = (index: number) => {
    if (manualItems.length > 1) {
      setManualItems(manualItems.filter((_, i) => i !== index));
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🍽️ Menu Data Manager</h1>
      
      {/* Tab Navigation */}
      <div className="bg-white rounded-lg shadow-md mb-6">
        <div className="border-b border-gray-200">
          <nav className="flex space-x-8 px-6">
            <button
              onClick={() => setActiveTab('scrape')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'scrape'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              🔍 Auto-Scrape Menu
            </button>
            <button
              onClick={() => setActiveTab('upload')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'upload'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              📄 Upload Menu Files
            </button>
            <button
              onClick={() => setActiveTab('manual')}
              className={`py-4 px-1 border-b-2 font-medium text-sm ${
                activeTab === 'manual'
                  ? 'border-blue-500 text-blue-600'
                  : 'border-transparent text-gray-500 hover:text-gray-700 hover:border-gray-300'
              }`}
            >
              ✏️ Manual Entry
            </button>
          </nav>
        </div>

        {/* Tab Content */}
        <div className="p-6">
          {activeTab === 'scrape' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">🔍 Automatic Menu Scraping</h2>
              <p className="text-gray-600 mb-4">
                Enter your restaurant's website URL or delivery platform link to automatically extract your menu.
              </p>
        
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4 mb-4">
                <div>
                  <label className="block text-sm font-medium mb-2">Tenant ID</label>
                  <input
                    type="text"
                    value={tenantId}
                    onChange={(e) => setTenantId(e.target.value)}
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
                
                <div>
                  <label className="block text-sm font-medium mb-2">Restaurant URL</label>
                  <input
                    type="url"
                    value={url}
                    onChange={(e) => setUrl(e.target.value)}
                    placeholder="https://restaurant-website.com or delivery platform URL"
                    className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                  />
                </div>
              </div>
              
              <div className="flex flex-wrap gap-3">
                <button
                  onClick={scrapeAndStore}
                  disabled={loading}
                  className="bg-blue-500 text-white px-4 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {loading ? 'Scraping...' : 'Scrape & Store'}
                </button>
                
                <button
                  onClick={loadStoredData}
                  className="bg-gray-500 text-white px-4 py-2 rounded-md hover:bg-gray-600"
                >
                  Reload Data
                </button>
                
                {storedData && (
                  <>
                    <button
                      onClick={refreshData}
                      disabled={loading}
                      className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600 disabled:opacity-50"
                    >
                      Refresh from Source
                    </button>
                    
                    <button
                      onClick={deleteData}
                      className="bg-red-500 text-white px-4 py-2 rounded-md hover:bg-red-600"
                    >
                      Delete Data
                    </button>
                  </>
                )}
              </div>
            </div>
          )}

          {activeTab === 'upload' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">📄 Upload Menu Files</h2>
              <p className="text-gray-600 mb-4">
                Upload your menu as PDF, images, or documents. We'll process them manually and set up your menu within 24-48 hours.
              </p>
              
              <div className="mb-4">
                <label className="block text-sm font-medium mb-2">Select Menu Files</label>
                <input
                  id="file-upload"
                  type="file"
                  multiple
                  accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                  onChange={(e) => setUploadFiles(e.target.files)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                />
                <p className="text-sm text-gray-500 mt-1">
                  Accepted formats: PDF, JPG, PNG, DOC, DOCX (Max 10MB per file)
                </p>
              </div>

              <div className="bg-yellow-50 border border-yellow-200 rounded-md p-4 mb-4">
                <div className="flex">
                  <div className="flex-shrink-0">
                    <span className="text-yellow-400">💰</span>
                  </div>
                  <div className="ml-3">
                    <h3 className="text-sm font-medium text-yellow-800">Manual Processing Fee</h3>
                    <p className="text-sm text-yellow-700 mt-1">
                      Manual menu processing requires a one-time fee of $49. This includes professional data entry, 
                      formatting, and quality assurance to ensure your menu is perfectly integrated.
                    </p>
                  </div>
                </div>
              </div>

              <button
                onClick={handleFileUpload}
                disabled={submissionLoading || !uploadFiles}
                className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
              >
                {submissionLoading ? 'Uploading...' : 'Upload Menu Files'}
              </button>
            </div>
          )}

          {activeTab === 'manual' && (
            <div>
              <h2 className="text-xl font-semibold mb-4">✏️ Manual Menu Entry</h2>
              <p className="text-gray-600 mb-4">
                Enter your menu items manually. This is free and your menu will be active immediately.
              </p>

              <div className="space-y-4 mb-6">
                {manualItems.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-4">
                    <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
                      <div>
                        <label className="block text-sm font-medium mb-1">Item Name *</label>
                        <input
                          type="text"
                          value={item.name}
                          onChange={(e) => updateManualItem(index, 'name', e.target.value)}
                          placeholder="e.g., Margherita Pizza"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Price</label>
                        <input
                          type="text"
                          value={item.price}
                          onChange={(e) => updateManualItem(index, 'price', e.target.value)}
                          placeholder="e.g., $12.99"
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        />
                      </div>
                      
                      <div>
                        <label className="block text-sm font-medium mb-1">Category</label>
                        <select
                          value={item.category}
                          onChange={(e) => updateManualItem(index, 'category', e.target.value)}
                          className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                        >
                          <option value="Appetizer">Appetizer</option>
                          <option value="Main Course">Main Course</option>
                          <option value="Dessert">Dessert</option>
                          <option value="Beverage">Beverage</option>
                          <option value="Side">Side</option>
                          <option value="Special">Special</option>
                        </select>
                      </div>
                      
                      <div className="flex items-end">
                        <button
                          onClick={() => removeManualItem(index)}
                          disabled={manualItems.length === 1}
                          className="bg-red-500 text-white px-3 py-2 rounded-md hover:bg-red-600 disabled:opacity-50"
                        >
                          Remove
                        </button>
                      </div>
                    </div>
                    
                    <div className="mt-3">
                      <label className="block text-sm font-medium mb-1">Description</label>
                      <textarea
                        value={item.description}
                        onChange={(e) => updateManualItem(index, 'description', e.target.value)}
                        placeholder="e.g., Fresh mozzarella, tomato sauce, basil"
                        rows={2}
                        className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
                      />
                    </div>
                  </div>
                ))}
              </div>

              <div className="flex gap-3 mb-6">
                <button
                  onClick={addManualItem}
                  className="bg-green-500 text-white px-4 py-2 rounded-md hover:bg-green-600"
                >
                  + Add Item
                </button>
                
                <button
                  onClick={handleManualSubmission}
                  disabled={submissionLoading}
                  className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
                >
                  {submissionLoading ? 'Saving...' : 'Save Menu'}
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {/* Stored Data Display */}
      {storedData ? (
        <div className="space-y-6">
          {/* Status Card */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4 flex items-center">
              📊 Data Status
              {storedData.isStale && (
                <span className="ml-2 bg-orange-100 text-orange-800 text-xs px-2 py-1 rounded-full">
                  STALE
                </span>
              )}
              {!storedData.isStale && (
                <span className="ml-2 bg-green-100 text-green-800 text-xs px-2 py-1 rounded-full">
                  FRESH
                </span>
              )}
            </h2>
            
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
              <div>
                <h3 className="font-semibold text-lg">{storedData.restaurantName}</h3>
                <p className="text-sm text-gray-600">Restaurant Name</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">{storedData.menu.length}</h3>
                <p className="text-sm text-gray-600">Menu Items</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">{storedData.dataSource}</h3>
                <p className="text-sm text-gray-600">Data Source</p>
              </div>
            </div>
            
            <div className="mt-4 text-sm text-gray-600">
              <p><strong>Source:</strong> {storedData.source}</p>
              <p><strong>Last Scraped:</strong> {new Date(storedData.lastScraped).toLocaleString()}</p>
              <p><strong>Age:</strong> {Math.round((new Date().getTime() - new Date(storedData.lastScraped).getTime()) / (1000 * 60 * 60))} hours old</p>
            </div>
          </div>

          {/* Menu Items */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">🍽️ Menu Items</h2>
            
            <div className="max-h-96 overflow-y-auto">
              <div className="grid gap-3">
                {storedData.menu.map((item, index) => (
                  <div key={index} className="border border-gray-200 rounded-md p-3">
                    <div className="flex justify-between items-start">
                      <div className="flex-1">
                        <h4 className="font-medium">{item.name}</h4>
                        {item.description && (
                          <p className="text-sm text-gray-600 mt-1">{item.description}</p>
                        )}
                        {item.category && (
                          <span className="inline-block bg-blue-100 text-blue-800 text-xs px-2 py-1 rounded mt-2">
                            {item.category}
                          </span>
                        )}
                      </div>
                      {item.price && (
                        <div className="text-green-600 font-semibold ml-4">
                          {item.price}
                        </div>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>

          {/* Special Offers */}
          {storedData.specialOffers && storedData.specialOffers.length > 0 && (
            <div className="bg-white rounded-lg shadow-md p-6">
              <h2 className="text-xl font-semibold mb-4">🎉 Special Offers</h2>
              <ul className="list-disc pl-6 space-y-2">
                {storedData.specialOffers.map((offer, index) => (
                  <li key={index} className="text-sm">{offer}</li>
                ))}
              </ul>
            </div>
          )}

          {/* Scraping History */}
          <div className="bg-white rounded-lg shadow-md p-6">
            <h2 className="text-xl font-semibold mb-4">📈 Scraping History</h2>
            
            <div className="overflow-x-auto">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Timestamp
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Status
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Items Found
                    </th>
                    <th className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider">
                      Source
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {storedData.scrapingHistory.map((attempt, index) => (
                    <tr key={index}>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {new Date(attempt.timestamp).toLocaleString()}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex px-2 py-1 text-xs font-semibold rounded-full ${
                          attempt.success 
                            ? 'bg-green-100 text-green-800' 
                            : 'bg-red-100 text-red-800'
                        }`}>
                          {attempt.success ? 'Success' : 'Failed'}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-900">
                        {attempt.itemsFound}
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-500 max-w-xs truncate">
                        {attempt.source}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        </div>
      ) : (
        <div className="bg-gray-50 rounded-lg p-8 text-center">
          <h3 className="text-lg font-medium text-gray-900 mb-2">No Stored Data</h3>
          <p className="text-gray-600 mb-4">
            This tenant doesn't have any stored menu data yet. 
            Scrape from a restaurant website or delivery platform to get started.
          </p>
          
          <div className="text-sm text-gray-500">
            <p><strong>Try these examples:</strong></p>
            <ul className="mt-2 space-y-1">
              <li>• Restaurant websites with online menus</li>
              <li>• UberEats restaurant pages</li>
              <li>• DoorDash store pages</li>
              <li>• GrubHub restaurant listings</li>
            </ul>
          </div>
        </div>
      )}
    </div>
  );
} 