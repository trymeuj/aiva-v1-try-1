import ProfileCard from '@/app/profile/ProfileCard'
import AIAgentsSection from '@/app/profile/AIAgentsSection'
import PreferencesSection from './PrefencesSection'

export default function UserProfile() {
  return (
    <div id="user-profile" className="min-h-screen bg-gray-50 py-12 px-4 sm:px-6 lg:px-8">
      <div className="max-w-4xl mx-auto">
        {/* Header */}
        <div className="mb-10">
          <h1 className="text-3xl font-bold text-gray-900 mb-2">User Profile</h1>
          <p className="text-gray-600">Manage your account and AI agent preferences</p>
        </div>

        <ProfileCard />
        <AIAgentsSection />
        <PreferencesSection />
      </div>
    </div>
  )
}