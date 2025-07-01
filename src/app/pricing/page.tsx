import Header2 from "@/components/mvpblocks/header-2"
import SimplePricing from "@/components/mvpblocks/simple-pricing"
import Footer4Col from "@/components/mvpblocks/footer-4col"

export default function PricingPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header2 />
      <main className="flex-1">
        <SimplePricing />
      </main>
      <Footer4Col />
    </div>
  )
}
