import React, { useState } from 'react'
import { Link } from 'react-router-dom'
import { ArrowLeft, Play, Pause, RotateCcw, Trophy, Star, Target } from 'lucide-react'

const GamePage: React.FC = () => {
  const [isPlaying, setIsPlaying] = useState(false)
  const [score, setScore] = useState(0)
  const [level, setLevel] = useState(1)
  const [achievements, setAchievements] = useState<string[]>([])

  const handlePlayPause = () => {
    setIsPlaying(!isPlaying)
  }

  const handleReset = () => {
    setIsPlaying(false)
    setScore(0)
    setLevel(1)
    setAchievements([])
  }

  const handleScoreIncrease = () => {
    setScore(prev => prev + 10)
    if (score > 0 && score % 50 === 0) {
      setAchievements(prev => [...prev, `Level ${Math.floor(score / 50) + 1} Master!`])
    }
  }

  return (
    <div className="min-h-screen bg-gray-900 text-white">
      {/* Header */}
      <div className="bg-gray-800 border-b border-gray-700 p-4">
        <div className="flex items-center justify-between max-w-6xl mx-auto">
          <Link 
            to="/" 
            className="flex items-center text-gray-400 hover:text-white transition-colors"
          >
            <ArrowLeft className="w-5 h-5 mr-2" />
            Back to Home
          </Link>
          
          <div className="flex items-center space-x-6">
            <div className="text-center">
              <div className="text-sm text-gray-400">Score</div>
              <div className="text-xl font-bold text-blue-400">{score}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Level</div>
              <div className="text-xl font-bold text-green-400">{level}</div>
            </div>
            <div className="text-center">
              <div className="text-sm text-gray-400">Achievements</div>
              <div className="text-xl font-bold text-yellow-400">{achievements.length}</div>
            </div>
          </div>
        </div>
      </div>

      {/* Game Area */}
      <div className="flex-1 p-8">
        <div className="max-w-6xl mx-auto">
          {/* Game Controls */}
          <div className="flex justify-center mb-8">
            <div className="flex space-x-4">
              <button
                onClick={handlePlayPause}
                className="flex items-center px-6 py-3 bg-blue-600 hover:bg-blue-700 rounded-lg transition-colors"
              >
                {isPlaying ? (
                  <>
                    <Pause className="w-5 h-5 mr-2" />
                    Pause
                  </>
                ) : (
                  <>
                    <Play className="w-5 h-5 mr-2" />
                    Play
                  </>
                )}
              </button>
              
              <button
                onClick={handleReset}
                className="flex items-center px-6 py-3 bg-gray-600 hover:bg-gray-700 rounded-lg transition-colors"
              >
                <RotateCcw className="w-5 h-5 mr-2" />
                Reset
              </button>
            </div>
          </div>

          {/* Game Canvas */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-8 min-h-96 mb-8">
            <div className="text-center">
              <h2 className="text-2xl font-bold mb-4">Engineering Challenge</h2>
              <p className="text-gray-400 mb-8">
                Build your engineering masterpiece! Click on the components below to start building.
              </p>
              
              {/* Interactive Game Elements */}
              <div className="grid grid-cols-3 gap-4 max-w-md mx-auto mb-8">
                {[1, 2, 3, 4, 5, 6].map((item) => (
                  <button
                    key={item}
                    onClick={handleScoreIncrease}
                    className="bg-blue-600 hover:bg-blue-700 rounded-lg p-4 transition-colors cursor-pointer transform hover:scale-105"
                  >
                    <div className="text-2xl font-bold">{item}</div>
                    <div className="text-sm">Component</div>
                  </button>
                ))}
              </div>

              {/* Progress Bar */}
              <div className="w-full bg-gray-700 rounded-full h-2 mb-4">
                <div 
                  className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                  style={{ width: `${(score % 100)}%` }}
                ></div>
              </div>
              <p className="text-sm text-gray-400">Progress to next level: {score % 100}/100</p>
            </div>
          </div>

          {/* Achievements */}
          {achievements.length > 0 && (
            <div className="bg-yellow-900/20 border border-yellow-500/30 rounded-lg p-6 mb-8">
              <h3 className="text-xl font-bold mb-4 flex items-center">
                <Trophy className="w-6 h-6 mr-2 text-yellow-400" />
                Recent Achievements
              </h3>
              <div className="space-y-2">
                {achievements.slice(-3).map((achievement, index) => (
                  <div key={index} className="flex items-center text-yellow-300">
                    <Star className="w-4 h-4 mr-2" />
                    {achievement}
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Game Instructions */}
          <div className="bg-gray-800 rounded-lg border border-gray-700 p-6">
            <h3 className="text-xl font-bold mb-4 flex items-center">
              <Target className="w-6 h-6 mr-2 text-blue-400" />
              How to Play
            </h3>
            <ul className="space-y-2 text-gray-300">
              <li>• Click the Play button to start the game</li>
              <li>• Click on components to build your engineering project</li>
              <li>• Each component gives you 10 points</li>
              <li>• Reach 100 points to level up</li>
              <li>• Unlock achievements as you progress</li>
              <li>• More features coming soon!</li>
            </ul>
          </div>
        </div>
      </div>
    </div>
  )
}

export default GamePage
