import { Navbar } from "@/components/layout/Navbar"
import { Footer } from "@/components/layout/Footer"
import { ErrorFallback } from "@/components/shared/ErrorFallback"

export default function MarketingLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <ErrorFallback>
      <div className="min-h-screen flex flex-col">
        <Navbar />
        <main className="flex-1 pt-16">{children}</main>
        <Footer />
      </div>
    </ErrorFallback>
  )
}
