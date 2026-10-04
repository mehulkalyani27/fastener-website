import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { SectionHeader } from "@/components/ui/section-header";
import { contactContent } from "@/data/home";
import { ContactForm } from "@/features/contact/components/contact-form";

export function ContactSection() {
  return (
    <Section id="contact" tone="surface" aria-labelledby="contact-title">
      <Container className="grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-20">
        <SectionHeader
          id="contact-title"
          title={contactContent.title}
          description={contactContent.description}
          className="lg:sticky lg:top-[calc(var(--spacing-header)+3rem)] lg:self-start"
        />
        <ContactForm />
      </Container>
    </Section>
  );
}
