'use client';

import { useState } from 'react';

interface ScrapingResult {
  success: boolean;
  scrapedData?: {
    restaurantName: string;
    menu: Array<{
      name: string;
      description?: string;
      price?: string;
      category?: string;
    }>;
    scrapingMethod: string;
    debugInfo?: {
      retryAttempts?: number;
      strategies?: string[];
      screenshotPath?: string;
      elementsFound?: number;
    };
  };
  stats?: {
    itemsFound: number;
    scrapingMethod: string;
    retryAttempts: number;
    strategiesUsed: string[];
    screenshotPath?: string;
  };
  debug?: any;
  error?: string;
  details?: string;
}

export default function EnhancedScrapingTest() {
  const [url, setUrl] = useState('');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrapingResult | null>(null);

  const testUrls = [
    'https://www.grubhub.com/restaurant/mcdonalds-1-w-madison-st-chicago/1397720',
    'https://www.doordash.com/store/mcdonalds-1-w-madison-st-chicago-24847/',
    'https://www.ubereats.com/store/mcdonalds-1-w-madison-st/pGNdULz7RZSKFGgaIkHHAw',
    'https://www.subway.com/menu',
    'https://example.com'
  ];

  const handleScrape = async () => {
    if (!url.trim()) return;
    
    setLoading(true);
    setResult(null);
    
    try {
      const response = await fetch('/api/tenants/scrape-enhanced/test-restaurant', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url: url.trim() }),
      });
      
      const data: ScrapingResult = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: 'Failed to scrape menu',
        details: error instanceof Error ? error.message : 'Unknown error'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="max-w-6xl mx-auto p-6">
      <h1 className="text-3xl font-bold mb-6">🤖 Enhanced Menu Scraper Test</h1>
      
      <div className="bg-blue-50 border border-blue-200 rounded-lg p-4 mb-6">
        <h2 className="text-lg font-semibold text-blue-800 mb-2">✨ New Features</h2>
        <ul className="text-blue-700 space-y-1">
          <li>• <strong>Intelligent Fallback:</strong> When 0 items found, automatically tries multiple strategies</li>
          <li>• <strong>Universal Parsing:</strong> Comprehensive selectors that work across various websites</li>
          <li>• <strong>Text Mining:</strong> AI-powered menu item detection from raw page text</li>
          <li>• <strong>Auto Screenshots:</strong> Debugging screenshots saved automatically</li>
          <li>• <strong>Retry Statistics:</strong> Detailed reporting on strategies used</li>
        </ul>
      </div>

      <div className="space-y-4 mb-6">
        <div>
          <label className="block text-sm font-medium mb-2">Restaurant URL:</label>
          <input
            type="url"
            value={url}
            onChange={(e) => setUrl(e.target.value)}
            placeholder="Enter restaurant URL..."
            className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
          />
        </div>
        
        <div className="flex flex-wrap gap-2">
          <button
            onClick={handleScrape}
            disabled={loading || !url.trim()}
            className="px-4 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50"
          >
            {loading ? '🔄 Scraping...' : '🚀 Scrape Menu'}
          </button>
          
          <div className="flex flex-wrap gap-1">
            {testUrls.map((testUrl, index) => (
              <button
                key={index}
                onClick={() => setUrl(testUrl)}
                className="px-3 py-1 text-xs bg-gray-200 hover:bg-gray-300 rounded"
              >
                Test {index + 1}
              </button>
            ))}
          </div>
        </div>
      </div>

      {result && (
        <div className="space-y-4">
          {/* Success/Error Header */}
          <div className={`rounded-lg p-4 ${result.success ? 'bg-green-50 border border-green-200' : 'bg-red-50 border border-red-200'}`}>
            <h3 className={`font-semibold ${result.success ? 'text-green-800' : 'text-red-800'}`}>
              {result.success ? '✅ Scraping Successful' : '❌ Scraping Failed'}
            </h3>
            {result.error && (
              <p className="text-red-700 mt-1">{result.error}</p>
            )}
          </div>

          {/* Statistics */}
          {result.stats && (
            <div className="bg-gray-50 rounded-lg p-4">
              <h4 className="font-semibold mb-3">📊 Scraping Statistics</h4>
              <div className="grid grid-cols-2 md:grid-cols-4 gap-4 text-sm">
                <div>
                  <span className="text-gray-600">Items Found:</span>
                  <div className="font-semibold text-lg">{result.stats.itemsFound}</div>
                </div>
                <div>
                  <span className="text-gray-600">Method:</span>
                  <div className="font-semibold">{result.stats.scrapingMethod}</div>
                </div>
                <div>
                  <span className="text-gray-600">Retry Attempts:</span>
                  <div className="font-semibold">{result.stats.retryAttempts}</div>
                </div>
                <div>
                  <span className="text-gray-600">Strategies:</span>
                  <div className="font-semibold">{result.stats.strategiesUsed?.length || 0}</div>
                </div>
              </div>
              
              {result.stats.strategiesUsed && result.stats.strategiesUsed.length > 0 && (
                <div className="mt-3">
                  <span className="text-gray-600 text-sm">Strategies Used:</span>
                  <div className="flex flex-wrap gap-1 mt-1">
                    {result.stats.strategiesUsed.map((strategy, index) => (
                      <span key={index} className="px-2 py-1 bg-blue-100 text-blue-800 text-xs rounded">
                        {strategy}
                      </span>
                    ))}
                  </div>
                </div>
              )}

              {result.stats.screenshotPath && (
                <div className="mt-3">
                  <span className="text-gray-600 text-sm">Debug Screenshot:</span>
                  <div className="text-xs text-blue-600 mt-1">{result.stats.screenshotPath}</div>
                </div>
              )}
            </div>
          )}

          {/* Restaurant Info */}
          {result.scrapedData && (
            <div className="bg-white border rounded-lg p-4">
              <h4 className="font-semibold mb-3">🏪 Restaurant Information</h4>
              <div className="mb-4">
                <span className="text-gray-600">Name:</span>
                <div className="font-semibold">{result.scrapedData.restaurantName}</div>
              </div>
              
              <h5 className="font-semibold mb-2">📋 Menu Items ({result.scrapedData.menu.length})</h5>
              {result.scrapedData.menu.length > 0 ? (
                <div className="space-y-2 max-h-60 overflow-y-auto">
                  {result.scrapedData.menu.slice(0, 20).map((item, index) => (
                    <div key={index} className="border-l-3 border-l-blue-400 pl-3 py-1">
                      <div className="font-medium">{item.name}</div>
                      {item.description && (
                        <div className="text-sm text-gray-600">{item.description}</div>
                      )}
                      {item.price && (
                        <div className="text-sm font-semibold text-green-600">{item.price}</div>
                      )}
                    </div>
                  ))}
                  {result.scrapedData.menu.length > 20 && (
                    <div className="text-sm text-gray-500 italic">
                      ... and {result.scrapedData.menu.length - 20} more items
                    </div>
                  )}
                </div>
              ) : (
                <div className="text-gray-500 italic">No menu items found</div>
              )}
            </div>
          )}

          {/* Debug Info */}
          {result.debug && (
            <details className="bg-gray-50 rounded-lg p-4">
              <summary className="font-semibold cursor-pointer">🔍 Debug Information</summary>
              <pre className="mt-2 text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                {JSON.stringify(result.debug, null, 2)}
              </pre>
            </details>
          )}
        </div>
      )}
    </div>
  );
} 