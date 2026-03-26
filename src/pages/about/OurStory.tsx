import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import PageHeader from "../../components/about/PageHeader";
import ContentSection from "../../components/about/ContentSection";
import ImageTextBlock from "../../components/about/ImageTextBlock";
import AboutSidebar from "../../components/about/AboutSidebar";
import { buildVersionedUrl } from "@/lib/versionSync";

const OurStory = () => {
  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <div className="hidden lg:block">
          <AboutSidebar />
        </div>
        
        <main className="w-full lg:w-[70vw] lg:ml-auto px-6">
          <PageHeader 
            title="Our Story" 
            subtitle="Making thoughtful gifting easy — so you never have to wing it again"
          />
          
          <ContentSection>
            <ImageTextBlock
              image={buildVersionedUrl("/founders.webp")}
              imageAlt="The GOOJ team"
              title="Get Out Of Jail"
              content="GOOJ was born from a simple, universal problem: buying gifts is stressful. Whether it's a birthday, anniversary, or a 'just because' moment, most men know the feeling of panic-buying something last minute and hoping for the best. We built GOOJ to fix that — curated gift boxes that are thoughtful, personal, and ready to impress."
              imagePosition="left"
            />
          </ContentSection>

          <ContentSection title="Our Approach">
            <div className="grid md:grid-cols-2 gap-12">
              <div className="space-y-6">
                <h3 className="text-xl font-light text-foreground">Tactical Gifting</h3>
                <p className="text-muted-foreground leading-relaxed">
                  We use situational marketing to meet you exactly where you are — whether it's her birthday next week, Mother's Day is around the corner, or you just want to show you care. Every box is designed for a specific occasion, so you always pick the right one.
                </p>
              </div>
              <div className="space-y-6">
                <h3 className="text-xl font-light text-foreground">The Personal Touch</h3>
                <p className="text-muted-foreground leading-relaxed">
                  Every GOOJ box can be personalised. Upload a photo for the keepsake frame, add a handwritten message card, and choose from premium consumables and lasting keepsakes. It's thoughtful gifting without the effort.
                </p>
              </div>
            </div>
          </ContentSection>

          <ContentSection title="Our Values">
            <div className="grid md:grid-cols-3 gap-8">
              <div className="space-y-4">
                <h3 className="text-lg font-light text-foreground">Thoughtfulness</h3>
                <p className="text-muted-foreground">
                  Every item in every box is chosen with care. We obsess over the details so you don't have to.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-light text-foreground">Quality</h3>
                <p className="text-muted-foreground">
                  From the packaging to the products inside, everything meets our standard for premium quality.
                </p>
              </div>
              <div className="space-y-4">
                <h3 className="text-lg font-light text-foreground">Personalisation</h3>
                <p className="text-muted-foreground">
                  Photo frames, message cards, and curated selections make every box feel one-of-a-kind.
                </p>
              </div>
            </div>
          </ContentSection>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default OurStory;
