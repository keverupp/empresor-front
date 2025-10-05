import React from "react";
import Header2 from "@/components/mvpblocks/header-2";
import Notebook from "@/components/mvpblocks/notebook";
import Feature2 from "@/components/mvpblocks/feature-2";
import FAQ2 from "@/components/mvpblocks/faq-2";
import Footer4Col from "@/components/mvpblocks/footer-4col";

export default function HomePage() {
  return (
    <div className="min-h-screen bg-background">
      {/* Header/Navigation */}
      <Header2 />

      <main className="relative z-0 flex flex-col gap-16 pt-16">
        {/* Hero Section with Notebook */}
        <section id="hero" className="relative">
          <div className="relative mx-auto max-w-7xl px-4 pb-8 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-muted/30 p-2 shadow-inner shadow-black/5 dark:shadow-black/20">
              <div className="rounded-[26px] bg-card shadow-[0_-8px_24px_-18px_rgba(255,255,255,0.45),0_30px_60px_-40px_rgba(15,23,42,0.55)] transition-shadow duration-500 hover:shadow-[0_-10px_30px_-20px_rgba(255,255,255,0.55),0_40px_70px_-45px_rgba(15,23,42,0.6)]">
                <Notebook />
              </div>
            </div>
          </div>
        </section>

        {/* Features Section */}
        <section id="features" className="relative">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-muted/20 p-2 shadow-inner shadow-black/5 dark:shadow-black/10">
              <div className="rounded-[26px] bg-card shadow-[0_-6px_22px_-18px_rgba(255,255,255,0.35),0_25px_55px_-35px_rgba(15,23,42,0.55)]">
                <Feature2 />
              </div>
            </div>
          </div>
        </section>

        {/* FAQ Section */}
        <section id="faq" className="relative pb-16">
          <div className="relative mx-auto max-w-7xl px-4 sm:px-6 lg:px-8">
            <div className="rounded-3xl bg-muted/20 p-2 shadow-inner shadow-black/5 dark:shadow-black/15">
              <div className="rounded-[26px] bg-card shadow-[0_-6px_22px_-18px_rgba(255,255,255,0.35),0_25px_55px_-35px_rgba(15,23,42,0.55)]">
                <FAQ2 />
              </div>
            </div>
          </div>
        </section>
      </main>

      {/* Footer */}
      <Footer4Col />
    </div>
  );
}
