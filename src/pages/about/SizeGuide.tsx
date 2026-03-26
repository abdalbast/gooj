import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import PageHeader from "../../components/about/PageHeader";
import ContentSection from "../../components/about/ContentSection";
import { Button } from "../../components/ui/button";
import AboutSidebar from "../../components/about/AboutSidebar";

const GiftGuide = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <div className="hidden lg:block">
          <AboutSidebar />
        </div>
        
        <main className="w-full lg:w-[70vw] lg:ml-auto px-6">
        <PageHeader 
          title="Gift Guide" 
          subtitle="Not sure which box to choose? We've got you covered."
        />
        
        <ContentSection title="Choose by Occasion">
          <div className="grid md:grid-cols-2 gap-8">
            <div className="bg-muted/10 rounded-lg p-8 space-y-4">
              <h3 className="text-xl font-light text-foreground">Birthday</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                Go with The Birthday Box (£65) for a solid, no-fuss option. If you want to go all out, The Luxury Box (£120) will make a real statement.
              </p>
              <Button variant="outline" className="rounded-none" asChild>
                <a href="/category/for-her-birthday">Shop Birthday Boxes</a>
              </Button>
            </div>
            <div className="bg-muted/10 rounded-lg p-8 space-y-4">
              <h3 className="text-xl font-light text-foreground">Anniversary</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The Anniversary Box (£85) strikes the right balance between romantic and practical. Add a photo for the frame insert to make it personal.
              </p>
              <Button variant="outline" className="rounded-none" asChild>
                <a href="/category/anniversary">Shop Anniversary Boxes</a>
              </Button>
            </div>
            <div className="bg-muted/10 rounded-lg p-8 space-y-4">
              <h3 className="text-xl font-light text-foreground">For Mum</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                The Mum Box (£55) is packed with pampering treats she'll actually use. Works for Mother's Day, her birthday, or just to say thanks.
              </p>
              <Button variant="outline" className="rounded-none" asChild>
                <a href="/category/for-mum">Shop Mum Boxes</a>
              </Button>
            </div>
            <div className="bg-muted/10 rounded-lg p-8 space-y-4">
              <h3 className="text-xl font-light text-foreground">Just Because</h3>
              <p className="text-muted-foreground text-sm leading-relaxed">
                No occasion? No problem. The Just Because Box (£45) is a compact, thoughtful option for when you want to show you care — without overthinking it.
              </p>
              <Button variant="outline" className="rounded-none" asChild>
                <a href="/category/just-because">Shop Just Because Boxes</a>
              </Button>
            </div>
          </div>
        </ContentSection>

        <ContentSection title="How It Works">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-3">
              <div className="text-2xl font-light text-foreground">1</div>
              <h4 className="text-lg font-light text-foreground">Pick a Box</h4>
              <p className="text-muted-foreground text-sm">Choose by occasion, budget, or just go with your gut. Every box is curated with quality items she'll love.</p>
            </div>
            <div className="space-y-3">
              <div className="text-2xl font-light text-foreground">2</div>
              <h4 className="text-lg font-light text-foreground">Personalise It</h4>
              <p className="text-muted-foreground text-sm">Upload a photo for the frame insert and write a personal message. We'll include a handwritten card — free of charge.</p>
            </div>
            <div className="space-y-3">
              <div className="text-2xl font-light text-foreground">3</div>
              <h4 className="text-lg font-light text-foreground">We Deliver</h4>
              <p className="text-muted-foreground text-sm">Sit back while we handle the rest. Every box arrives gift-ready with premium packaging. Express and overnight delivery available.</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection title="Budget Guide">
          <div className="space-y-4">
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-foreground font-light">Under £50</span>
              <span className="text-muted-foreground text-sm">The Just Because Box, The Thank You Box</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-foreground font-light">£50 – £75</span>
              <span className="text-muted-foreground text-sm">The Birthday Box, The Mum Box, The Partner Box</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-foreground font-light">£75 – £100</span>
              <span className="text-muted-foreground text-sm">The Anniversary Box, The Date Night Box</span>
            </div>
            <div className="flex justify-between py-3 border-b border-border">
              <span className="text-foreground font-light">£100+</span>
              <span className="text-muted-foreground text-sm">The Luxury Box, The Ultimate Box</span>
            </div>
          </div>
        </ContentSection>

        <ContentSection title="Still Not Sure?">
          <div className="space-y-6">
            <p className="text-muted-foreground">
              Drop us a message and we'll help you pick the perfect box. Or set up a date reminder so you never miss an important occasion again.
            </p>
            <div className="flex flex-col sm:flex-row gap-4">
              <Button variant="outline" className="rounded-none" asChild>
                <a href="/about/customer-care">Contact Us</a>
              </Button>
              <Button className="rounded-none" asChild>
                <a href="/reminders">Set Up Date Reminders</a>
              </Button>
            </div>
          </div>
        </ContentSection>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default GiftGuide;
