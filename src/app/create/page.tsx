import { redirect } from 'next/navigation'

export default function CreatePage() {
  // In a real application, we would handle the agent creation logic here
  // For now, we'll redirect to the software selection page
  redirect('/software')
}