import React from 'react'
import { Link } from 'react-router-dom'
import { Play, BookOpen, Settings, Github, ExternalLink } from 'lucide-react'

const HomePage: React.FC = () => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-900 via-purple-900 to-indigo-900">
      <div className="text-center max-w-4xl mx-auto px-6">
        {/* Header */}
        <div className="mb-12">
          <h1 className="text-6xl font-bold mb-4 bg-gradient-to-r from-blue-400 to-purple-400 bg-clip-text text-transparent">
            Engineering Forge
          </h1>
          <p className="text-xl text-gray-300 mb-2">Version 1.0</p>
          <p className="text-lg text-gray-400">
            The ultimate engineering game experience
          </p>
        </div>

        {/* Navigation Cards */}
        <div className="grid md:grid-cols-3 gap-6 mb-12">
          <Link 
            to="/game" 
            className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            <Play className="w-12 h-12 mx-auto mb-4 text-blue-400 group-hover:text-blue-300" />
            <h3 className="text-xl font-semibold mb-2">Start Game</h3>
            <p className="text-gray-400">Begin your engineering journey</p>
          </Link>

          <a 
            href="/docs" 
            target="_blank"
            rel="noopener noreferrer"
            className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105"
          >
            <BookOpen className="w-12 h-12 mx-auto mb-4 text-green-400 group-hover:text-green-300" />
            <h3 className="text-xl font-semibold mb-2">Documentation</h3>
            <p className="text-gray-400">Learn the game mechanics</p>
            <ExternalLink className="w-4 h-4 inline ml-2" />
          </a>

          <div className="group bg-white/10 backdrop-blur-sm border border-white/20 rounded-xl p-8 hover:bg-white/20 transition-all duration-300 hover:scale-105">
            <Settings className="w-12 h-12 mx-auto mb-4 text-purple-400 group-hover:text-purple-300" />
            <h3 className="text-xl font-semibold mb-2">Settings</h3>
            <p className="text-gray-400">Coming soon</p>
          </div>
        </div>

        {/* Game Features */}
        <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-xl p-8 mb-8">
          <h2 className="text-2xl font-bold mb-6">Game Features</h2>
          <div className="grid md:grid-cols-2 gap-6 text-left">
            <div>
              <h3 className="text-lg font-semibold mb-2 text-blue-400">Engineering Challenges</h3>
              <p className="text-gray-300">Solve complex engineering problems and build amazing projects.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-green-400">Progress Tracking</h3>
              <p className="text-gray-300">Track your learning progress and unlock new challenges.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-purple-400">Interactive Learning</h3>
              <p className="text-gray-300">Learn engineering concepts through hands-on gameplay.</p>
            </div>
            <div>
              <h3 className="text-lg font-semibold mb-2 text-yellow-400">Real-time Feedback</h3>
              <p className="text-gray-300">Get instant feedback on your engineering decisions.</p>
            </div>
          </div>
        </div>

        {/* Footer */}
        <div className="text-center text-gray-500">
          <p className="mb-4">© 2024 Engineering Guild. All rights reserved.</p>
          <div className="flex justify-center space-x-4">
            <a 
              href="https://github.com/EngineeringGuild/engineering-forge" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <Github className="w-4 h-4 mr-2" />
              GitHub
            </a>
            <a 
              href="/docs" 
              target="_blank" 
              rel="noopener noreferrer"
              className="flex items-center text-gray-400 hover:text-white transition-colors"
            >
              <BookOpen className="w-4 h-4 mr-2" />
              Documentation
            </a>
          </div>
        </div>
      </div>
    </div>
  )
}

export default HomePage
