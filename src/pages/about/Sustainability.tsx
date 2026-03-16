import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import PageHeader from "../../components/about/PageHeader";
import ContentSection from "../../components/about/ContentSection";
import AboutSidebar from "../../components/about/AboutSidebar";

const Sustainability = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <div className="hidden lg:block">
          <AboutSidebar />
        </div>
        
        <main className="w-full lg:w-[70vw] lg:ml-auto px-6">
        <PageHeader 
          title="Sustainability" 
          subtitle="Thoughtful gifting that's kind to the planet"
        />
        
        <ContentSection title="Our Commitment">
          <div className="grid md:grid-cols-2 gap-12 mb-16">
            <div className="space-y-6">
              <h3 className="text-xl font-light text-foreground">Ethical Sourcing</h3>
              <p className="text-muted-foreground leading-relaxed">
                We partner with suppliers who share our values. Every product in our gift boxes is sourced from responsible brands with transparent supply chains, ensuring quality and ethics go hand in hand.
              </p>
            </div>
            <div className="space-y-6">
              <h3 className="text-xl font-light text-foreground">Sustainable Packaging</h3>
              <p className="text-muted-foreground leading-relaxed">
                Our boxes are crafted from recycled and recyclable materials. We've eliminated single-use plastics from our packaging, replacing them with biodegradable alternatives that still deliver a premium unboxing experience.
              </p>
            </div>
          </div>

          <div className="bg-muted/10 rounded-lg p-8">
            <h3 className="text-2xl font-light text-foreground mb-6">Our Impact Goals</h3>
            <div className="grid md:grid-cols-3 gap-8">
              <div>
                <div className="text-3xl font-light text-primary mb-2">100%</div>
                <p className="text-sm text-muted-foreground">Recyclable packaging by 2026</p>
              </div>
              <div>
                <div className="text-3xl font-light text-primary mb-2">Zero</div>
                <p className="text-sm text-muted-foreground">Single-use plastic in our boxes</p>
              </div>
              <div>
                <div className="text-3xl font-light text-primary mb-2">50%</div>
                <p className="text-sm text-muted-foreground">Carbon offset on all deliveries</p>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection title="Responsible Gifting">
          <div className="space-y-8">
            <p className="text-lg text-muted-foreground leading-relaxed">
              We believe gifting should feel good — for the person giving, the person receiving, and the planet.
            </p>
            
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-light text-foreground">Quality Over Quantity</h3>
                <p className="text-muted-foreground">
                  Every item is chosen for its quality and longevity. We'd rather include one beautiful keepsake than fill a box with throwaway items.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-light text-foreground">Local & Independent</h3>
                <p className="text-muted-foreground">
                  We prioritise UK-based and independent brands, supporting small businesses while reducing our carbon footprint.
                </p>
              </div>
            </div>
          </div>
        </ContentSection>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default Sustainability;
