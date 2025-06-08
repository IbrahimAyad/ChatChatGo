'use client';

import { useState } from 'react';

interface MenuCustomization {
  type: 'substitute' | 'add' | 'remove' | 'side' | 'sauce' | 'size' | 'cooking';
  name: string;
  options: string[];
  price?: string;
  category?: string;
}

interface MenuItem {
  name: string;
  description?: string;
  price?: string;
  category?: string;
  customizations?: MenuCustomization[];
  baseIngredients?: string[];
  allergens?: string[];
}

interface ScrapingResult {
  success: boolean;
  scrapedData?: {
    restaurantName: string;
    menu: MenuItem[];
    globalCustomizations?: MenuCustomization[];
    scrapingMethod: string;
  };
  stats?: {
    itemsFound: number;
    scrapingMethod: string;
    retryAttempts: number;
    strategiesUsed: string[];
  };
  error?: string;
}

export default function CustomizationTest() {
  const [url, setUrl] = useState('https://royalewithcheese.menu/menu/');
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState<ScrapingResult | null>(null);

  const handleScrape = async () => {
    setLoading(true);
    setResult(null);

    try {
      const response = await fetch(`/api/tenants/scrape-enhanced/test-customizations`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ url }),
      });

      const data = await response.json();
      setResult(data);
    } catch (error) {
      setResult({
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error occurred'
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-gray-50 py-8">
      <div className="max-w-6xl mx-auto px-4">
        <div className="bg-white rounded-lg shadow-lg p-6 mb-8">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">
            🍔 Enhanced Menu Customization Parsing Test
          </h1>
          <p className="text-gray-600 mb-6">
            Test the intelligent parsing of customizations, toppings, allergens, and modifications.
          </p>

          <div className="flex gap-4 mb-6">
            <input
              type="url"
              value={url}
              onChange={(e) => setUrl(e.target.value)}
              placeholder="Enter restaurant menu URL..."
              className="flex-1 px-4 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-transparent"
            />
            <button
              onClick={handleScrape}
              disabled={loading || !url}
              className="px-6 py-2 bg-blue-600 text-white rounded-lg hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed flex items-center gap-2"
            >
              {loading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  Parsing...
                </>
              ) : (
                '🧠 Parse Customizations'
              )}
            </button>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <button 
              onClick={() => setUrl('https://royalewithcheese.menu/menu/')}
              className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="font-semibold">🏰 Royale with Cheese</div>
              <div className="text-sm text-gray-600">Rich customization options</div>
            </button>
            <button 
              onClick={() => setUrl('https://www.subway.com/menu')}
              className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="font-semibold">🥪 Subway</div>
              <div className="text-sm text-gray-600">Extensive toppings</div>
            </button>
            <button 
              onClick={() => setUrl('https://www.grubhub.com/restaurant/mcdonalds-1-w-madison-st-chicago/1397720')}
              className="p-3 text-left border border-gray-200 rounded-lg hover:bg-gray-50"
            >
              <div className="font-semibold">🍟 McDonald's</div>
              <div className="text-sm text-gray-600">Size & modification options</div>
            </button>
          </div>
        </div>

        {result && (
          <div className="space-y-6">
            {/* Global Customizations */}
            {result.scrapedData?.globalCustomizations && result.scrapedData.globalCustomizations.length > 0 && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">🌐 Global Customizations Detected</h2>
                <div className="space-y-4">
                  {result.scrapedData.globalCustomizations.slice(0, 5).map((customization, index) => (
                    <div key={index} className="border border-gray-200 rounded-lg p-4">
                      <div className="flex items-center gap-2 mb-2">
                        <span className={`px-2 py-1 rounded text-xs font-semibold ${
                          customization.type === 'substitute' ? 'bg-blue-100 text-blue-800' :
                          customization.type === 'sauce' ? 'bg-red-100 text-red-800' :
                          customization.type === 'add' ? 'bg-green-100 text-green-800' :
                          'bg-gray-100 text-gray-800'
                        }`}>
                          {customization.type}
                        </span>
                        <span className="font-medium">{customization.name}</span>
                      </div>
                      <div className="text-sm text-gray-600">
                        {customization.options.slice(0, 3).map((option, optIndex) => (
                          <span key={optIndex} className="inline-block bg-gray-100 rounded px-2 py-1 mr-2 mb-1">
                            {option.length > 40 ? option.substring(0, 40) + '...' : option}
                          </span>
                        ))}
                        {customization.options.length > 3 && (
                          <span className="text-gray-500">+{customization.options.length - 3} more</span>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {/* AI Context for Customer Service */}
            {result.scrapedData && (
              <div className="bg-white rounded-lg shadow-lg p-6">
                <h2 className="text-xl font-semibold mb-4">🤖 AI Customer Service Context</h2>
                <div className="bg-gray-50 rounded-lg p-4">
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Restaurant:</strong> {result.scrapedData.restaurantName}
                  </p>
                  <p className="text-sm text-gray-700 mb-2">
                    <strong>Customization Capabilities:</strong> 
                    {result.scrapedData.globalCustomizations && result.scrapedData.globalCustomizations.length > 0 ? (
                      <span className="text-green-600 ml-1">
                        ✅ Advanced (Substitutions, Toppings, Sauces detected)
                      </span>
                    ) : (
                      <span className="text-yellow-600 ml-1">
                        ⚠️ Basic (Limited customization data)
                      </span>
                    )}
                  </p>
                  <p className="text-xs text-gray-500 mt-3">
                    <strong>Customer Service Instructions:</strong> This restaurant offers extensive customization options. 
                    Customers can substitute proteins, add/remove toppings, and select from various sauce options. 
                    Always confirm customizations and check for allergen concerns.
                  </p>
                </div>
              </div>
            )}

            {result.error && (
              <div className="bg-red-50 border border-red-200 rounded-lg p-6">
                <h3 className="text-lg font-semibold text-red-800 mb-2">❌ Error</h3>
                <p className="text-red-700">{result.error}</p>
              </div>
            )}
          </div>
        )}
      </div>
    </div>
  );
} 