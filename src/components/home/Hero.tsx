import Link from 'next/link'

export default function Hero() {
  return (
    <div className="text-center mb-16">
      <h1 className="text-4xl sm:text-5xl font-bold text-gray-900 mb-6">Create Your Personal AI Assistant</h1>
      <p className="text-xl text-gray-600 max-w-3xl mx-auto mb-8">
        Customize an AI agent that works across your favorite applications and adapts to your specific needs.
      </p>
      <Link 
        href="/create" 
        className="inline-block px-8 py-4 bg-blue-600 text-white font-medium text-lg rounded-lg shadow-md hover:bg-blue-700 transition-colors duration-300 transform hover:scale-105"
      >
        Create Agent
      </Link>
    </div>
  )
}