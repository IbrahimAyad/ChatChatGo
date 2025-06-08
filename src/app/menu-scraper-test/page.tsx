'use client';

import { useState } from 'react';

export default function MenuScraperTest() {
  const [url, setUrl] = useState('');
  const [tenantId, setTenantId] = useState('test-restaurant');
  const [result, setResult] = useState<any>(null);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const handleScrape = async () => {
    if (!url) {
      setError('Please enter a URL');
      return;
    }

    setLoading(true);
    setError('');
    setResult(null);

    try {
      const response = await fetch(`/api/tenants/scrape/${tenantId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      setResult(data);

      if (!response.ok) {
        setError(data.error || 'Failed to scrape menu');
      }
    } catch (err) {
      setError('Network error');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-4xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">Menu Scraper Test</h1>
      
      <div className="bg-white rounded-lg shadow-md p-6 mb-6">
        <h2 className="text-xl font-semibold mb-4">Test Menu Scraping</h2>
        
        <div className="space-y-4">
          <div>
            <label className="block text-sm font-medium mb-2">
              Tenant ID
            </label>
            <input
              type="text"
              value={tenantId}
              onChange={(e) => setTenantId(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="test-restaurant"
            />
          </div>
          
          <div>
            <label className="block text-sm font-medium mb-2">
              Restaurant URL to Scrape
            </label>
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-blue-500"
              placeholder="https://example-restaurant.com or https://ubereats.com/store/..."
            />
          </div>
          
          <button
            onClick={handleScrape}
            disabled={loading}
            className="bg-blue-500 text-white px-6 py-2 rounded-md hover:bg-blue-600 disabled:opacity-50"
          >
            {loading ? 'Scraping...' : 'Scrape Menu'}
          </button>
        </div>
        
        <div className="mt-4 text-sm text-gray-600">
          <p><strong>Try these examples:</strong></p>
          <ul className="list-disc pl-6 mt-2">
            <li>Any restaurant website with menu</li>
            <li>UberEats restaurant page</li>
            <li>DoorDash restaurant page</li>
            <li>GrubHub restaurant page</li>
          </ul>
        </div>
      </div>

      {error && (
        <div className="bg-red-50 border border-red-200 rounded-md p-4 mb-6">
          <p className="text-red-600">{error}</p>
        </div>
      )}

      {result && (
        <div className="bg-white rounded-lg shadow-md p-6">
          <h2 className="text-xl font-semibold mb-4">Scraping Results</h2>
          
          {result.success ? (
            <div className="space-y-4">
              <div className="bg-green-50 border border-green-200 rounded-md p-3">
                <p className="text-green-600 font-medium">✅ Successfully scraped!</p>
                <p className="text-sm text-gray-600">Source: {result.scrapedData?.source}</p>
              </div>
              
              <div>
                <h3 className="font-semibold text-lg">{result.scrapedData?.restaurantName}</h3>
                {result.scrapedData?.phone && <p>📞 {result.scrapedData.phone}</p>}
                {result.scrapedData?.location && <p>📍 {result.scrapedData.location}</p>}
                {result.scrapedData?.hours && <p>🕒 {result.scrapedData.hours}</p>}
              </div>
              
              <div>
                <h4 className="font-semibold mb-2">Menu Items ({result.scrapedData?.menu?.length || 0})</h4>
                <div className="max-h-60 overflow-y-auto border rounded-md p-3">
                  {result.scrapedData?.menu?.map((item: any, index: number) => (
                    <div key={index} className="mb-2 pb-2 border-b last:border-b-0">
                      <div className="font-medium">{item.name}</div>
                      {item.price && <div className="text-green-600">{item.price}</div>}
                      {item.description && <div className="text-sm text-gray-600">{item.description}</div>}
                    </div>
                  ))}
                </div>
              </div>
              
              {result.scrapedData?.specialOffers && result.scrapedData.specialOffers.length > 0 && (
                <div>
                  <h4 className="font-semibold mb-2">Special Offers</h4>
                  <ul className="list-disc pl-6">
                    {result.scrapedData.specialOffers.map((offer: string, index: number) => (
                      <li key={index} className="text-sm">{offer}</li>
                    ))}
                  </ul>
                </div>
              )}
              
              <div>
                <h4 className="font-semibold mb-2">AI Context Preview</h4>
                <pre className="bg-gray-50 p-3 rounded-md text-xs overflow-x-auto max-h-40">
                  {result.scrapedData?.aiContext}
                </pre>
              </div>
              
              <div className="text-xs text-gray-500">
                Last updated: {result.scrapedData?.lastUpdated}
              </div>
            </div>
          ) : (
            <div className="bg-red-50 border border-red-200 rounded-md p-3">
              <p className="text-red-600">❌ Scraping failed: {result.error}</p>
              {result.details && <p className="text-sm text-gray-600 mt-1">{result.details}</p>}
            </div>
          )}
        </div>
      )}
    </div>
  );
} 