import Header2 from "@/components/mvpblocks/header-2"
import FeatureSteps from "@/components/mvpblocks/feature-2"
import Footer4Col from "@/components/mvpblocks/footer-4col"

export default function FeaturesPage() {
  return (
    <div className="flex min-h-screen flex-col">
      <Header2 />
      <main className="flex-1">
        <FeatureSteps />
      </main>
      <Footer4Col />
    </div>
  )
}
