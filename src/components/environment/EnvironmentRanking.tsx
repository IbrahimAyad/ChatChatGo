'use client';

import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { InfrastructureProfile, RankingResult, DatabaseType, CloudProvider, IntegrationType, ScaleRequirement, BudgetRange, TechnicalLevel } from '@/types/environment';
import { rankingEngine } from '@/lib/environment-ranking';
import { Button } from '@/components/ui/Button';

interface EnvironmentRankingProps {
  className?: string;
}

export default function EnvironmentRanking({ className = '' }: EnvironmentRankingProps) {
  const [profile, setProfile] = useState<InfrastructureProfile>({
    id: 'demo_profile',
    name: 'Demo Profile',
    description: 'Sample infrastructure profile for demonstration',
    database: 'firebase' as DatabaseType,
    cloudProvider: 'vercel' as CloudProvider,
    integrations: ['webhook' as IntegrationType],
    scaleRequirement: 'medium' as ScaleRequirement,
    budgetRange: 'professional' as BudgetRange,
    technicalLevel: 'intermediate' as TechnicalLevel,
    constraints: {
      maxLatency: 300,
      complianceRequired: [],
      highAvailability: false,
      realTimeRequired: true,
    },
    existingServices: {},
  });

  const [results, setResults] = useState<RankingResult[] | null>(null);
  const [isLoading, setIsLoading] = useState(false);

  const handleAnalyze = async () => {
    setIsLoading(true);
    // Simulate API delay for demo
    await new Promise(resolve => setTimeout(resolve, 1500));
    const rankings = rankingEngine.rankConfigurations(profile);
    setResults(rankings);
    setIsLoading(false);
  };

  const handleProfileChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      [field]: value,
    }));
    setResults(null); // Clear results when profile changes
  };

  const handleConstraintChange = (field: string, value: any) => {
    setProfile(prev => ({
      ...prev,
      constraints: {
        ...prev.constraints,
        [field]: value,
      },
    }));
    setResults(null);
  };

  const getScoreColor = (score: number) => {
    if (score >= 80) return 'text-green-600';
    if (score >= 60) return 'text-yellow-600';
    return 'text-red-600';
  };

  const getScoreBarColor = (score: number) => {
    if (score >= 80) return 'bg-green-500';
    if (score >= 60) return 'bg-yellow-500';
    return 'bg-red-500';
  };

  return (
    <div className={`max-w-7xl mx-auto p-6 ${className}`}>
      {/* Header */}
      <div className="text-center mb-12">
        <h1 className="text-4xl font-bold bg-gradient-to-r from-purple-600 to-pink-600 bg-clip-text text-transparent mb-4">
          Environment Ranking System
        </h1>
        <p className="text-xl text-gray-600 max-w-3xl mx-auto">
          Our AI-powered compatibility matrix analyzes your infrastructure and recommends the optimal ChatChatGo configuration. 
          Get personalized recommendations based on your technical stack, budget, and requirements.
        </p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
        {/* Configuration Panel */}
        <div className="lg:col-span-1">
          <div className="bg-white rounded-xl shadow-lg p-6 sticky top-6">
            <h2 className="text-2xl font-bold text-gray-900 mb-6">Your Infrastructure</h2>
            
            <div className="space-y-6">
              {/* Database */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Database</label>
                <select
                  value={profile.database}
                  onChange={(e) => handleProfileChange('database', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="firebase">Firebase</option>
                  <option value="supabase">Supabase</option>
                  <option value="postgresql">PostgreSQL</option>
                  <option value="mysql">MySQL</option>
                  <option value="mongodb">MongoDB</option>
                  <option value="sqlite">SQLite</option>
                </select>
              </div>

              {/* Cloud Provider */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Cloud Provider</label>
                <select
                  value={profile.cloudProvider}
                  onChange={(e) => handleProfileChange('cloudProvider', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="vercel">Vercel</option>
                  <option value="aws">AWS</option>
                  <option value="gcp">Google Cloud</option>
                  <option value="azure">Azure</option>
                  <option value="self_hosted">Self-Hosted</option>
                </select>
              </div>

              {/* Scale Requirement */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Scale Requirement</label>
                <select
                  value={profile.scaleRequirement}
                  onChange={(e) => handleProfileChange('scaleRequirement', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="small">Small (0-1K users)</option>
                  <option value="medium">Medium (1K-10K users)</option>
                  <option value="large">Large (10K-100K users)</option>
                  <option value="enterprise">Enterprise (100K+ users)</option>
                </select>
              </div>

              {/* Budget Range */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Budget Range</label>
                <select
                  value={profile.budgetRange}
                  onChange={(e) => handleProfileChange('budgetRange', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="free">Free</option>
                  <option value="starter">Starter ($0-50/mo)</option>
                  <option value="professional">Professional ($50-500/mo)</option>
                  <option value="enterprise">Enterprise ($500+/mo)</option>
                </select>
              </div>

              {/* Technical Level */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Technical Level</label>
                <select
                  value={profile.technicalLevel}
                  onChange={(e) => handleProfileChange('technicalLevel', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                >
                  <option value="beginner">Beginner</option>
                  <option value="intermediate">Intermediate</option>
                  <option value="advanced">Advanced</option>
                  <option value="expert">Expert</option>
                </select>
              </div>

              {/* Constraints */}
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">Max Latency (ms)</label>
                <input
                  type="number"
                  value={profile.constraints.maxLatency}
                  onChange={(e) => handleConstraintChange('maxLatency', parseInt(e.target.value))}
                  className="w-full px-3 py-2 border border-gray-300 rounded-md focus:outline-none focus:ring-2 focus:ring-purple-500"
                  min="50"
                  max="2000"
                />
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="highAvailability"
                  checked={profile.constraints.highAvailability}
                  onChange={(e) => handleConstraintChange('highAvailability', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="highAvailability" className="text-sm text-gray-700">High Availability Required</label>
              </div>

              <div className="flex items-center">
                <input
                  type="checkbox"
                  id="realTimeRequired"
                  checked={profile.constraints.realTimeRequired}
                  onChange={(e) => handleConstraintChange('realTimeRequired', e.target.checked)}
                  className="mr-2"
                />
                <label htmlFor="realTimeRequired" className="text-sm text-gray-700">Real-time Chat Required</label>
              </div>
            </div>

            <Button
              onClick={handleAnalyze}
              disabled={isLoading}
              className="w-full mt-6"
              variant="primary"
            >
              {isLoading ? (
                <>
                  <svg className="animate-spin -ml-1 mr-3 h-5 w-5 text-white" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                  Analyzing...
                </>
              ) : (
                'Analyze Compatibility'
              )}
            </Button>
          </div>
        </div>

        {/* Results Panel */}
        <div className="lg:col-span-2">
          <AnimatePresence mode="wait">
            {results ? (
              <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="space-y-6"
              >
                <h2 className="text-2xl font-bold text-gray-900 mb-6">
                  Recommended Configurations ({results.length} found)
                </h2>

                {results.map((result, index) => (
                  <motion.div
                    key={result.configuration.id}
                    initial={{ opacity: 0, x: 20 }}
                    animate={{ opacity: 1, x: 0 }}
                    transition={{ delay: index * 0.1 }}
                    className="bg-white rounded-xl shadow-lg overflow-hidden"
                  >
                    {/* Header */}
                    <div className="p-6 border-b border-gray-200">
                      <div className="flex items-start justify-between">
                        <div className="flex-1">
                          <div className="flex items-center gap-3 mb-2">
                            <span className="bg-gradient-to-r from-purple-500 to-pink-500 text-white text-sm font-bold px-2 py-1 rounded">
                              #{result.rank}
                            </span>
                            <h3 className="text-xl font-bold text-gray-900">{result.configuration.name}</h3>
                            <span className={`text-2xl font-bold ${getScoreColor(result.score.overall)}`}>
                              {result.score.overall}%
                            </span>
                          </div>
                          <p className="text-gray-600 mb-3">{result.configuration.description}</p>
                          
                          {/* Tags */}
                          <div className="flex flex-wrap gap-2">
                            {result.tags.map((tag) => (
                              <span key={tag} className="px-2 py-1 bg-purple-100 text-purple-800 text-xs font-medium rounded-full">
                                {tag}
                              </span>
                            ))}
                          </div>
                        </div>
                        
                        <div className="text-right">
                          <div className="text-sm text-gray-500">Confidence</div>
                          <div className="text-lg font-bold text-gray-900">{result.confidence}%</div>
                        </div>
                      </div>
                    </div>

                    {/* Score Breakdown */}
                    <div className="p-6">
                      <h4 className="font-semibold text-gray-900 mb-4">Compatibility Breakdown</h4>
                      <div className="grid grid-cols-2 md:grid-cols-5 gap-4 mb-6">
                        {Object.entries(result.score.breakdown).map(([key, score]) => (
                          <div key={key} className="text-center">
                            <div className="relative w-16 h-16 mx-auto mb-2">
                              <svg className="w-16 h-16 transform -rotate-90" viewBox="0 0 36 36">
                                <path
                                  d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke="#e5e7eb"
                                  strokeWidth="2"
                                />
                                <path
                                  d="M18 2.0845
                                    a 15.9155 15.9155 0 0 1 0 31.831
                                    a 15.9155 15.9155 0 0 1 0 -31.831"
                                  fill="none"
                                  stroke={score >= 80 ? '#10b981' : score >= 60 ? '#f59e0b' : '#ef4444'}
                                  strokeWidth="2"
                                  strokeDasharray={`${score}, 100`}
                                />
                              </svg>
                              <div className="absolute inset-0 flex items-center justify-center">
                                <span className={`text-xs font-bold ${getScoreColor(score)}`}>{score}</span>
                              </div>
                            </div>
                            <div className="text-xs text-gray-600 capitalize">{key}</div>
                          </div>
                        ))}
                      </div>

                      {/* Costs */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6 p-4 bg-gray-50 rounded-lg">
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Setup Cost</div>
                          <div className="text-lg font-bold text-gray-900">
                            ${result.score.estimatedCosts.setup.toLocaleString()}
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Monthly</div>
                          <div className="text-lg font-bold text-gray-900">
                            ${result.score.estimatedCosts.monthly.toLocaleString()}/mo
                          </div>
                        </div>
                        <div className="text-center">
                          <div className="text-sm text-gray-500">Annual (10% off)</div>
                          <div className="text-lg font-bold text-gray-900">
                            ${result.score.estimatedCosts.annual.toLocaleString()}/yr
                          </div>
                        </div>
                      </div>

                      {/* Implementation Plan */}
                      <div className="mb-6">
                        <h5 className="font-semibold text-gray-900 mb-3">Implementation Timeline ({result.score.implementationPlan.totalDuration} days)</h5>
                        <div className="space-y-2">
                          {result.score.implementationPlan.phases.map((phase, phaseIndex) => (
                            <div key={phaseIndex} className="flex items-center gap-3">
                              <div className="w-8 h-8 bg-purple-100 text-purple-800 rounded-full flex items-center justify-center text-sm font-bold">
                                {phaseIndex + 1}
                              </div>
                              <div className="flex-1">
                                <div className="font-medium text-gray-900">{phase.name}</div>
                                <div className="text-sm text-gray-600">{phase.duration} days • {phase.tasks.join(', ')}</div>
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>

                      {/* Reasons */}
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
                        {result.score.reasons.strengths.length > 0 && (
                          <div>
                            <h6 className="font-semibold text-green-800 mb-2">✓ Strengths</h6>
                            <ul className="space-y-1 text-green-700">
                              {result.score.reasons.strengths.map((strength, i) => (
                                <li key={i}>• {strength}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {result.score.reasons.concerns.length > 0 && (
                          <div>
                            <h6 className="font-semibold text-yellow-800 mb-2">⚠ Concerns</h6>
                            <ul className="space-y-1 text-yellow-700">
                              {result.score.reasons.concerns.map((concern, i) => (
                                <li key={i}>• {concern}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                        
                        {result.score.reasons.recommendations.length > 0 && (
                          <div>
                            <h6 className="font-semibold text-blue-800 mb-2">💡 Recommendations</h6>
                            <ul className="space-y-1 text-blue-700">
                              {result.score.reasons.recommendations.map((rec, i) => (
                                <li key={i}>• {rec}</li>
                              ))}
                            </ul>
                          </div>
                        )}
                      </div>
                    </div>
                  </motion.div>
                ))}
              </motion.div>
            ) : (
              <motion.div
                initial={{ opacity: 0 }}
                animate={{ opacity: 1 }}
                className="text-center py-12"
              >
                <div className="w-24 h-24 mx-auto mb-6 bg-gradient-to-r from-purple-100 to-pink-100 rounded-full flex items-center justify-center">
                  <svg className="w-12 h-12 text-purple-600" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z" />
                  </svg>
                </div>
                <h3 className="text-xl font-semibold text-gray-900 mb-2">Ready to Analyze</h3>
                <p className="text-gray-600">Configure your infrastructure profile and click "Analyze Compatibility" to get personalized chatbot recommendations.</p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </div>
    </div>
  );
} 