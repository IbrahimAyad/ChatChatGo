'use client';

import React, { useState } from 'react';

export default function SimpleDemo() {
  const [message, setMessage] = useState('');
  const [responses, setResponses] = useState<string[]>([]);

  const handleClick = () => {
    console.log('Button clicked!');
    setMessage('AI is working! 🎉');
    setResponses(prev => [...prev, `Response ${prev.length + 1}: Hello! How can I help you today?`]);
  };

  return (
    <div className="min-h-screen bg-gray-900 text-white p-8">
      <h1 className="text-4xl font-bold mb-8">🧪 Simple AI Demo Test</h1>
      
      <div className="bg-gray-800 p-6 rounded-lg mb-4">
        <button 
          onClick={handleClick}
          className="bg-blue-500 hover:bg-blue-700 text-white font-bold py-2 px-4 rounded"
        >
          Test AI Response
        </button>
        
        {message && (
          <div className="mt-4 p-4 bg-green-800 rounded">
            {message}
          </div>
        )}
      </div>

      <div className="space-y-2">
        {responses.map((response, index) => (
          <div key={index} className="p-3 bg-gray-700 rounded">
            {response}
          </div>
        ))}
      </div>
    </div>
  );
} 