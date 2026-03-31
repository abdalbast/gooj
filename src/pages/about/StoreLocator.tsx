import { Suspense, lazy } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import PageHeader from "../../components/about/PageHeader";
import ContentSection from "../../components/about/ContentSection";
import { Button } from "../../components/ui/button";
import AboutSidebar from "../../components/about/AboutSidebar";

const loadStoreMap = () => import("../../components/about/StoreMap");
const StoreMap = lazy(loadStoreMap);

const StoreLocator = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <div className="hidden lg:block">
          <AboutSidebar />
        </div>
        
        <main className="w-full lg:w-[70vw] lg:ml-auto px-6">
        <PageHeader 
          title="Find Us" 
          subtitle="GOOJ is primarily an online experience, but here's where to find us"
        />
        
        <ContentSection title="Our HQ">
          <div className="bg-background rounded-lg p-8 border border-border">
            <div className="grid md:grid-cols-2 gap-8">
              <div className="space-y-4">
                <h3 className="text-xl font-light text-foreground">GOOJ HQ & Showroom</h3>
                <div className="space-y-2 text-muted-foreground">
                  <p>42 Clerkenwell Road</p>
                  <p>London, EC1M 5PS</p>
                  <p>+44 20 7946 0958</p>
                  <p>Mon-Fri: 9AM-5PM GMT</p>
                </div>
                <p className="text-sm text-muted-foreground mt-4">
                  Our showroom is open by appointment for corporate clients, press, and anyone who wants to see our boxes in person before ordering.
                </p>
                <div className="flex flex-col sm:flex-row gap-3 pt-4">
                  <Button variant="outline" className="rounded-none">Get Directions</Button>
                  <Button className="rounded-none">Book a Visit</Button>
                </div>
              </div>
              <div className="space-y-4">
                <h4 className="text-lg font-light text-foreground">Services Available</h4>
                <ul className="grid grid-cols-2 gap-2">
                  {["Gift Wrapping", "Personalisation", "Corporate Gifting", "Bulk Orders", "Press Enquiries", "Partnerships"].map((service, i) => (
                    <li key={i} className="text-sm text-muted-foreground flex items-center">
                      <span className="w-2 h-2 bg-primary rounded-full mr-3 flex-shrink-0"></span>
                      {service}
                    </li>
                  ))}
                </ul>
              </div>
            </div>
          </div>
        </ContentSection>

        <ContentSection title="Visit The Showroom">
          <Suspense
            fallback={
              <div className="h-96 rounded-lg border border-border bg-muted/10 flex items-center justify-center text-sm text-muted-foreground">
                Loading map…
              </div>
            }
          >
            <StoreMap />
          </Suspense>
        </ContentSection>

        <ContentSection title="Corporate Gifting">
          <div className="space-y-6">
            <p className="text-lg text-muted-foreground leading-relaxed">
              Looking to send gifts to your team, clients, or at events? We offer bespoke corporate gift boxes with custom branding, bulk pricing, and white-label packaging options.
            </p>
            <div className="grid md:grid-cols-3 gap-8 mt-12">
              <div className="space-y-3">
                <h4 className="text-lg font-light text-foreground">Employee Gifts</h4>
                <p className="text-muted-foreground text-sm">Show appreciation with curated boxes for birthdays, milestones, or just because.</p>
              </div>
              <div className="space-y-3">
                <h4 className="text-lg font-light text-foreground">Client Gifting</h4>
                <p className="text-muted-foreground text-sm">Impress clients with premium gift boxes that reflect your brand values.</p>
              </div>
              <div className="space-y-3">
                <h4 className="text-lg font-light text-foreground">Event Favours</h4>
                <p className="text-muted-foreground text-sm">Custom boxes for conferences, launches, and celebrations of all sizes.</p>
              </div>
            </div>
            <div className="pt-8">
              <Button size="lg" className="rounded-none">Enquire About Corporate Gifting</Button>
            </div>
          </div>
        </ContentSection>

        <ContentSection title="Online First">
          <div className="bg-muted/10 rounded-lg p-8">
            <h3 className="text-xl font-light text-foreground mb-4">Built for convenience</h3>
            <p className="text-muted-foreground mb-6">
              GOOJ is designed to be the easiest way to send a thoughtful gift. Browse, personalise, and order from anywhere — on the web or through our app. We handle the rest, delivering gift-ready boxes straight to her door.
            </p>
            <Button variant="outline" className="rounded-none" asChild>
              <a href="/category/shop">Start Shopping</a>
            </Button>
          </div>
        </ContentSection>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default StoreLocator;
