import ElevenLabsVoiceChat from '../../components/ElevenLabsVoiceChat';

export default function VoiceConversation() {
  // Sample restaurant data for Royale with Cheese
  const restaurantData = {
    name: "Royale with Cheese",
    type: "burger_joint",
    phone: "(555) 123-ROYALE",
    location: "Downtown",
    hours: "Mon-Thu 11AM-10PM, Fri-Sat 11AM-11PM, Sun 12PM-9PM"
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-900 via-purple-900 to-indigo-900 p-8">
      <div className="max-w-6xl mx-auto">
        <div className="text-center mb-8">
          <h1 className="text-4xl font-bold text-white mb-4">
            🎤 ElevenLabs Conversation Demo
          </h1>
          <p className="text-purple-200 text-lg">
            Experience natural voice conversations with your restaurant AI assistant
          </p>
          <div className="mt-4 text-purple-300 text-sm">
            <p>✨ This uses your beautiful custom interface + ElevenLabs natural voice</p>
            <p>🚀 No generic embed widget - full control over design & functionality</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Voice Chat Component */}
          <div>
            <ElevenLabsVoiceChat 
              restaurantData={restaurantData}
              className="h-full"
            />
          </div>

          {/* Restaurant Info Panel */}
          <div className="bg-white/10 backdrop-blur-xl rounded-xl border border-white/20 p-6">
            <h2 className="text-2xl font-bold text-white mb-6">
              🍔 {restaurantData.name}
            </h2>
            
            <div className="space-y-4">
              <div className="bg-black/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-300 mb-3">
                  Popular Menu Items
                </h3>
                <div className="space-y-2 text-white">
                  <div className="flex justify-between">
                    <span>• Mia Wallace BBQ Burger</span>
                    <span className="text-green-400">$16.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Havana Breakfast Burger</span>
                    <span className="text-green-400">$14.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Kruncher Spicy Burger</span>
                    <span className="text-green-400">$15.99</span>
                  </div>
                  <div className="flex justify-between">
                    <span>• Nacho Cheese Ravioli</span>
                    <span className="text-green-400">$12.99</span>
                  </div>
                </div>
              </div>

              <div className="bg-black/20 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-purple-300 mb-3">
                  Real-Time Info
                </h3>
                <div className="space-y-2 text-white text-sm">
                  <p>📞 Phone: {restaurantData.phone}</p>
                  <p>📍 Location: {restaurantData.location}</p>
                  <p>🕒 Hours: {restaurantData.hours}</p>
                  <p>⏱️ Current Wait: 8 minutes</p>
                  <p>🔥 Today's Special: Truffle Fries with any burger</p>
                </div>
              </div>

              <div className="bg-green-500/20 border border-green-500/50 rounded-lg p-4">
                <h3 className="text-lg font-semibold text-green-300 mb-2">
                  ✅ What You Can Ask:
                </h3>
                <div className="text-green-200 text-sm space-y-1">
                  <p>• "What's today's special?"</p>
                  <p>• "How long is the wait time?"</p>
                  <p>• "What are your most popular items?"</p>
                  <p>• "Do you have gluten-free options?"</p>
                  <p>• "What time do you close?"</p>
                  <p>• "Can I place an order for pickup?"</p>
                </div>
              </div>
            </div>
          </div>
        </div>

        <div className="mt-8 text-center">
          <div className="bg-blue-500/20 border border-blue-500/50 rounded-lg p-6">
            <h3 className="text-xl font-bold text-blue-300 mb-3">
              🌟 Key Benefits vs Generic Embed
            </h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-blue-200 text-sm">
              <div>
                <h4 className="font-semibold mb-2">🎨 Custom Design</h4>
                <p>Your beautiful interface that matches restaurant branding</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🔗 Live Integration</h4>
                <p>Real-time menu, wait times, and restaurant data</p>
              </div>
              <div>
                <h4 className="font-semibold mb-2">🚀 Full Control</h4>
                <p>Complete customization and feature control</p>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
} 