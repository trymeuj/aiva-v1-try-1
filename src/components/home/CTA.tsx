import Link from 'next/link'

export default function CTA() {
  return (
    <div className="bg-blue-600 text-white rounded-lg p-8 text-center">
      <h2 className="text-3xl font-bold mb-4">Ready to Create Your Personal AI Agent?</h2>
      <p className="text-xl mb-6 max-w-3xl mx-auto">
        Start building your custom AI assistant in just a few clicks.
      </p>
      <Link 
        href="/create" 
        className="inline-block px-8 py-4 bg-white text-blue-600 font-medium text-lg rounded-lg shadow-md hover:bg-gray-100 transition-colors duration-300"
      >
        Get Started Now
      </Link>
    </div>
  )
}