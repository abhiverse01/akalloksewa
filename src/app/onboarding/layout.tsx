export default function OnboardingLayout({ children }: { children: React.ReactNode }) {
  return (
    <div data-theme="dark" className="min-h-screen flex items-center justify-center p-4" style={{ background: 'var(--bg-base)' }}>
      {children}
    </div>
  )
}
