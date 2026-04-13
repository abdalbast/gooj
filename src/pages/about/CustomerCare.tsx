import { type FormEvent, useState } from "react";
import Header from "../../components/header/Header";
import Footer from "../../components/footer/Footer";
import PageHeader from "../../components/about/PageHeader";
import ContentSection from "../../components/about/ContentSection";
import { Button } from "../../components/ui/button";
import { Input } from "../../components/ui/input";
import { Textarea } from "../../components/ui/textarea";
import { Accordion, AccordionContent, AccordionItem, AccordionTrigger } from "../../components/ui/accordion";
import AboutSidebar from "../../components/about/AboutSidebar";
import {
  formatShippingPrice,
  SHIPPING_OPTIONS,
} from "@/lib/commerce";

const CustomerCare = () => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formStatus, setFormStatus] = useState<string | null>(null);
  const [formError, setFormError] = useState<string | null>(null);

  const handleSubmit = async (event: FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setFormStatus(null);
    setFormError(null);

    const formElement = event.currentTarget;
    const formData = new FormData(formElement);
    const payload = {
      firstName: String(formData.get("firstName") ?? "").trim(),
      lastName: String(formData.get("lastName") ?? "").trim(),
      email: String(formData.get("email") ?? "").trim(),
      orderNumber: String(formData.get("orderNumber") ?? "").trim(),
      message: String(formData.get("message") ?? "").trim(),
    };

    if (!payload.email) {
      setFormError("Email is required.");
      return;
    }

    if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(payload.email)) {
      setFormError("Please provide a valid email address.");
      return;
    }

    if (!payload.message) {
      setFormError("Message is required.");
      return;
    }

    setIsSubmitting(true);

    try {
      const response = await fetch("/api/contact", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(payload),
      });

      if (!response.ok) {
        throw new Error(`Contact request failed with status ${response.status}`);
      }

      formElement.reset();
      setFormStatus("Thanks for your message. Our team will get back to you soon.");
    } catch (error) {
      console.error("Contact request failed", error);
      setFormError("We could not send your message right now. Please try again shortly.");
    } finally {
      setIsSubmitting(false);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <div className="flex">
        <div className="hidden lg:block">
          <AboutSidebar />
        </div>
        
        <main className="w-full lg:w-[70vw] lg:ml-auto px-6">
        <PageHeader 
          title="Customer Care" 
          subtitle="We're here to help with all your gifting needs"
        />
        
        <ContentSection title="Contact Information">
          <div className="grid md:grid-cols-3 gap-8">
            <div className="space-y-4">
              <h3 className="text-lg font-light text-foreground">Phone</h3>
              <p className="text-muted-foreground">+44 20 7946 0958</p>
              <p className="text-sm text-muted-foreground">Mon-Fri: 9AM-6PM GMT<br />Sat: 10AM-4PM GMT</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-foreground">Email</h3>
              <p className="text-muted-foreground">hello@gooj.co.uk</p>
              <p className="text-sm text-muted-foreground">Response within 24 hours</p>
            </div>
            <div className="space-y-4">
              <h3 className="text-lg font-light text-foreground">Live Chat</h3>
              <Button variant="outline" className="rounded-none">Start Chat</Button>
              <p className="text-sm text-muted-foreground">Available during business hours</p>
            </div>
          </div>
        </ContentSection>

        <ContentSection title="Frequently Asked Questions">
          <Accordion type="single" collapsible className="space-y-4">
            <AccordionItem value="whats-inside" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">What comes inside a GOOJ gift box?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Each GOOJ box contains a curated selection of quality items — typically a mix of keepsake products (candles, photo frames, accessories) and consumables (artisan chocolates, bath products, teas). Every box includes a personalisation card and premium packaging.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="personalisation" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">How does personalisation work?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                You can upload a photo for the photo frame insert and write a personal message that we'll include as a handwritten card. Personalisation is free on all boxes. Simply add your details when selecting your gift box.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="delivery" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">What are your delivery options?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                We offer free UK standard delivery ({SHIPPING_OPTIONS.standard.deliveryWindow}). Express delivery is available for {formatShippingPrice("express")}, and overnight delivery is available for {formatShippingPrice("overnight")}. All boxes are carefully packaged to arrive in perfect condition.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="returns" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">Can I return a gift box?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Non-personalised boxes can be returned within 14 days in their original condition. Personalised items (with photo inserts or custom messages) are non-refundable as they are made to order. If a product arrives damaged, contact us and we'll sort it immediately.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="corporate" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">Do you offer corporate gifting?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Yes! We offer bulk orders with custom branding for corporate gifting. Whether it's employee appreciation, client gifts, or event favours — get in touch and we'll create something bespoke for your needs.
              </AccordionContent>
            </AccordionItem>

            <AccordionItem value="date-reminders" className="border border-border rounded-lg px-6">
              <AccordionTrigger className="text-left hover:no-underline">How do date reminders work?</AccordionTrigger>
              <AccordionContent className="text-muted-foreground">
                Save important dates (birthdays, anniversaries) in your GOOJ account and we'll remind you before the date so you never miss a gifting moment. In the mobile app, you'll receive push notifications ahead of time.
              </AccordionContent>
            </AccordionItem>
          </Accordion>
        </ContentSection>

        <ContentSection title="Contact Form">
          <div>
            <form className="space-y-6" onSubmit={handleSubmit}>
              <div className="grid md:grid-cols-2 gap-6">
                <div className="space-y-2">
                  <label className="text-sm font-light text-foreground">First Name</label>
                  <Input className="rounded-none" name="firstName" placeholder="Enter your first name" />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-light text-foreground">Last Name</label>
                  <Input className="rounded-none" name="lastName" placeholder="Enter your last name" />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-light text-foreground">Email</label>
                <Input required type="email" className="rounded-none" name="email" placeholder="Enter your email" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-light text-foreground">Order Number (Optional)</label>
                <Input className="rounded-none" name="orderNumber" placeholder="Enter your order number if applicable" />
              </div>
              <div className="space-y-2">
                <label className="text-sm font-light text-foreground">How can we help you?</label>
                <Textarea className="rounded-none min-h-[120px]" name="message" placeholder="Please describe your enquiry in detail" required />
              </div>
              {formError ? <p className="text-sm text-destructive">{formError}</p> : null}
              {formStatus ? <p className="text-sm text-foreground">{formStatus}</p> : null}
              <Button disabled={isSubmitting} type="submit" className="w-full rounded-none">
                {isSubmitting ? "Sending..." : "Send Message"}
              </Button>
            </form>
          </div>
        </ContentSection>
        </main>
      </div>
      
      <Footer />
    </div>
  );
};

export default CustomerCare;
