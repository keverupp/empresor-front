import React from "react";
import Header2 from "@/components/mvpblocks/header-2";
import Notebook from "@/components/mvpblocks/notebook";
import Feature2 from "@/components/mvpblocks/feature-2";
import FAQ2 from "@/components/mvpblocks/faq-2";
import Footer4Col from "@/components/mvpblocks/footer-4col";

export default function HomePage() {
  return (
    <div className="min-h-screen">
      {/* Header/Navigation */}
      <Header2 />

      {/* Hero Section with Notebook */}
      <section id="hero">
        <Notebook />
      </section>

      {/* Features Section */}
      <section id="features" className="py-16">
        <Feature2 />
      </section>

      {/* FAQ Section */}
      <section id="faq" className="py-16">
        <FAQ2 />
      </section>

      {/* Footer */}
      <Footer4Col />
    </div>
  );
}
