import OnboardingFlow from '../components/features/OnboardingFlow'

export default function OnboardingPage() {

  const handleOnboardingComplete = (data: any) => {
    console.log('Onboarding completed with data:', data)
    // Data is already saved to the database via the OnboardingFlow component
  }

  return (
    <OnboardingFlow onComplete={handleOnboardingComplete} />
  )
}