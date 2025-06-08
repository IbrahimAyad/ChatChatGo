'use client';

import { useState } from 'react';

interface RestaurantConfig {
  restaurant_name: string;
  restaurant_type: string;
  phone_number: string;
  address: string;
  business_hours: string;
  specialties: string[];
  dietary_options: string[];
  signature_items: Array<{
    name: string;
    price: string;
    description: string;
    category: string;
    popularity_rank: number;
    allergens: string[];
    trending?: boolean;
  }>;
  branding: {
    tone: string;
    voice_style: string;
    key_values: string[];
  };
}

export default function RestaurantOnboarding() {
  const [config, setConfig] = useState<RestaurantConfig>({
    restaurant_name: '',
    restaurant_type: 'burger',
    phone_number: '',
    address: '',
    business_hours: '',
    specialties: [],
    dietary_options: [],
    signature_items: [],
    branding: {
      tone: 'friendly',
      voice_style: 'professional',
      key_values: []
    }
  });

  const [currentStep, setCurrentStep] = useState(1);
  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedAgent, setGeneratedAgent] = useState<any>(null);

  const restaurantTypes = [
    'burger', 'italian', 'pizza', 'chinese', 'mexican', 'japanese', 'american', 'thai', 'indian', 'mediterranean'
  ];

  const toneOptions = ['casual', 'upscale', 'family-friendly', 'trendy', 'professional'];
  const voiceStyleOptions = ['friendly', 'professional', 'energetic', 'sophisticated', 'warm'];

  const addSignatureItem = () => {
    setConfig(prev => ({
      ...prev,
      signature_items: [
        ...prev.signature_items,
        {
          name: '',
          price: '',
          description: '',
          category: '',
          popularity_rank: prev.signature_items.length + 1,
          allergens: [],
          trending: false
        }
      ]
    }));
  };

  const updateSignatureItem = (index: number, field: string, value: any) => {
    setConfig(prev => ({
      ...prev,
      signature_items: prev.signature_items.map((item, i) => 
        i === index ? { ...item, [field]: value } : item
      )
    }));
  };

  const generateVoiceAgent = async () => {
    setIsGenerating(true);
    try {
      const response = await fetch('/api/restaurant-template', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          ...config,
          restaurant_id: `${config.restaurant_name.toLowerCase().replace(/\s+/g, '_')}_${Date.now()}`
        })
      });

      const result = await response.json();
      if (result.success) {
        setGeneratedAgent(result.agent_config);
        setCurrentStep(5);
      }
    } catch (error) {
      console.error('Error generating agent:', error);
    } finally {
      setIsGenerating(false);
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-100 p-6">
      <div className="max-w-4xl mx-auto">
        <div className="bg-white rounded-2xl shadow-xl p-8">
          <div className="text-center mb-8">
            <h1 className="text-3xl font-bold text-gray-900 mb-2">ChatChatGo Voice Intelligence</h1>
            <p className="text-xl text-gray-600">Create your restaurant's AI voice assistant in minutes</p>
            <div className="mt-4 flex justify-center">
              <div className="flex space-x-2">
                {[1, 2, 3, 4, 5].map((step) => (
                  <div key={step} className={`w-3 h-3 rounded-full ${currentStep >= step ? 'bg-blue-500' : 'bg-gray-300'}`} />
                ))}
              </div>
            </div>
          </div>

          {currentStep === 1 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Restaurant Basics</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Name</label>
                <input
                  type="text"
                  value={config.restaurant_name}
                  onChange={(e) => setConfig(prev => ({ ...prev, restaurant_name: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Enter your restaurant name"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Type</label>
                <select
                  value={config.restaurant_type}
                  onChange={(e) => setConfig(prev => ({ ...prev, restaurant_type: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {restaurantTypes.map(type => (
                    <option key={type} value={type}>{type.charAt(0).toUpperCase() + type.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Phone Number</label>
                <input
                  type="text"
                  value={config.phone_number}
                  onChange={(e) => setConfig(prev => ({ ...prev, phone_number: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="(555) 123-4567"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Address</label>
                <input
                  type="text"
                  value={config.address}
                  onChange={(e) => setConfig(prev => ({ ...prev, address: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="123 Main St, City, State"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Business Hours</label>
                <input
                  type="text"
                  value={config.business_hours}
                  onChange={(e) => setConfig(prev => ({ ...prev, business_hours: e.target.value }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                  placeholder="Mon-Fri 11AM-10PM, Sat-Sun 12PM-11PM"
                />
              </div>

              <button
                onClick={() => setCurrentStep(2)}
                disabled={!config.restaurant_name || !config.phone_number}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600 disabled:bg-gray-300 disabled:cursor-not-allowed"
              >
                Next: Menu Items
              </button>
            </div>
          )}

          {currentStep === 2 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Signature Menu Items</h2>
              
              {config.signature_items.map((item, index) => (
                <div key={index} className="border border-gray-200 rounded-lg p-4 space-y-3">
                  <div className="flex justify-between items-center">
                    <h3 className="font-medium">Item #{index + 1}</h3>
                    <button
                      onClick={() => setConfig(prev => ({
                        ...prev,
                        signature_items: prev.signature_items.filter((_, i) => i !== index)
                      }))}
                      className="text-red-500 hover:text-red-700"
                    >
                      Remove
                    </button>
                  </div>
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Item name"
                      value={item.name}
                      onChange={(e) => updateSignatureItem(index, 'name', e.target.value)}
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <input
                      type="text"
                      placeholder="Price ($12.99)"
                      value={item.price}
                      onChange={(e) => updateSignatureItem(index, 'price', e.target.value)}
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                  </div>
                  
                  <textarea
                    placeholder="Description"
                    value={item.description}
                    onChange={(e) => updateSignatureItem(index, 'description', e.target.value)}
                    className="w-full p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    rows={2}
                  />
                  
                  <div className="grid grid-cols-2 gap-3">
                    <input
                      type="text"
                      placeholder="Category"
                      value={item.category}
                      onChange={(e) => updateSignatureItem(index, 'category', e.target.value)}
                      className="p-2 border border-gray-300 rounded focus:ring-2 focus:ring-blue-500"
                    />
                    <div className="flex items-center space-x-2">
                      <input
                        type="checkbox"
                        checked={item.trending || false}
                        onChange={(e) => updateSignatureItem(index, 'trending', e.target.checked)}
                        className="rounded"
                      />
                      <label className="text-sm">Trending Item</label>
                    </div>
                  </div>
                </div>
              ))}

              <button
                onClick={addSignatureItem}
                className="w-full border-2 border-dashed border-gray-300 rounded-lg py-3 text-gray-600 hover:border-blue-500 hover:text-blue-500"
              >
                + Add Menu Item
              </button>

              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentStep(1)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600"
                >
                  Next: Branding
                </button>
              </div>
            </div>
          )}

          {currentStep === 3 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Brand Personality</h2>
              
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Restaurant Tone</label>
                <select
                  value={config.branding.tone}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    branding: { ...prev.branding, tone: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {toneOptions.map(tone => (
                    <option key={tone} value={tone}>{tone.charAt(0).toUpperCase() + tone.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Voice Style</label>
                <select
                  value={config.branding.voice_style}
                  onChange={(e) => setConfig(prev => ({
                    ...prev,
                    branding: { ...prev.branding, voice_style: e.target.value }
                  }))}
                  className="w-full p-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500"
                >
                  {voiceStyleOptions.map(style => (
                    <option key={style} value={style}>{style.charAt(0).toUpperCase() + style.slice(1)}</option>
                  ))}
                </select>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentStep(2)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  onClick={() => setCurrentStep(4)}
                  className="flex-1 bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600"
                >
                  Next: Review
                </button>
              </div>
            </div>
          )}

          {currentStep === 4 && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4">Review Configuration</h2>
              
              <div className="bg-gray-50 rounded-lg p-4 space-y-3">
                <div><strong>Restaurant:</strong> {config.restaurant_name}</div>
                <div><strong>Type:</strong> {config.restaurant_type}</div>
                <div><strong>Phone:</strong> {config.phone_number}</div>
                <div><strong>Signature Items:</strong> {config.signature_items.length} items</div>
                <div><strong>Tone:</strong> {config.branding.tone}</div>
                <div><strong>Voice Style:</strong> {config.branding.voice_style}</div>
              </div>

              <div className="flex space-x-3">
                <button
                  onClick={() => setCurrentStep(3)}
                  className="flex-1 bg-gray-300 text-gray-700 py-3 px-6 rounded-lg font-medium hover:bg-gray-400"
                >
                  Back
                </button>
                <button
                  onClick={generateVoiceAgent}
                  disabled={isGenerating}
                  className="flex-1 bg-green-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-green-600 disabled:bg-gray-300"
                >
                  {isGenerating ? 'Generating...' : 'Generate Voice Agent'}
                </button>
              </div>
            </div>
          )}

          {currentStep === 5 && generatedAgent && (
            <div className="space-y-6">
              <h2 className="text-2xl font-semibold mb-4 text-green-600">🎉 Voice Agent Generated!</h2>
              
              <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                <h3 className="font-semibold text-green-800 mb-2">Next Steps:</h3>
                <ol className="list-decimal list-inside space-y-2 text-green-700">
                  <li>Upload the generated menu template to ElevenLabs Knowledge Base</li>
                  <li>Copy the system prompt to your ElevenLabs agent</li>
                  <li>Set the first message in your agent configuration</li>
                  <li>Connect your ChatChatGo API for real-time data</li>
                  <li>Test your voice agent!</li>
                </ol>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">First Message</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    {generatedAgent.first_message}
                  </div>
                </div>

                <div className="border border-gray-200 rounded-lg p-4">
                  <h4 className="font-semibold mb-2">Restaurant ID</h4>
                  <div className="bg-gray-50 p-3 rounded text-sm font-mono">
                    {generatedAgent.restaurant_id}
                  </div>
                </div>
              </div>

              <div className="border border-gray-200 rounded-lg p-4">
                <h4 className="font-semibold mb-2">System Prompt</h4>
                <div className="bg-gray-50 p-3 rounded text-sm font-mono max-h-40 overflow-y-auto">
                  {generatedAgent.system_prompt}
                </div>
              </div>

              <button
                onClick={() => {
                  setCurrentStep(1);
                  setConfig({
                    restaurant_name: '',
                    restaurant_type: 'burger',
                    phone_number: '',
                    address: '',
                    business_hours: '',
                    specialties: [],
                    dietary_options: [],
                    signature_items: [],
                    branding: {
                      tone: 'friendly',
                      voice_style: 'professional',
                      key_values: []
                    }
                  });
                  setGeneratedAgent(null);
                }}
                className="w-full bg-blue-500 text-white py-3 px-6 rounded-lg font-medium hover:bg-blue-600"
              >
                Create Another Restaurant
              </button>
            </div>
          )}
        </div>
      </div>
    </div>
  );
} 