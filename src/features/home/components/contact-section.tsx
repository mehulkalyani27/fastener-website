import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ButtonGroup } from "@/components/ui/button-group";
import { buttonClassName } from "@/components/ui/button-styles";
import { SectionHeader } from "@/components/ui/section-header";
import { contactContent, whatsappMessages } from "@/data/home";
import { contactInfo, phoneLinks, whatsappLink } from "@/data/site";
import { PhoneIcon, WhatsAppIcon } from "@/features/contact/components/contact-icons";
import { ContactForm } from "@/features/contact/components/contact-form";

export function ContactSection() {
  return (
    <Section id="contact" tone="surface" aria-labelledby="contact-title">
      <Container className="grid gap-10 lg:grid-cols-[2fr_3fr] lg:gap-20">
        <div className="lg:sticky lg:top-[calc(var(--spacing-header)+3rem)] lg:self-start">
          <SectionHeader
            id="contact-title"
            title={contactContent.title}
            description={contactContent.description}
          />
          <ButtonGroup className="mt-8">
            <a
              href={phoneLinks.call}
              aria-label={`${contactContent.callLabel}: ${contactInfo.phone}`}
              className={buttonClassName("primary", "gap-2.5")}
            >
              <PhoneIcon className="size-5" />
              {contactContent.callLabel}
            </a>
            <a
              href={whatsappLink(whatsappMessages.contact)}
              target="_blank"
              rel="noopener noreferrer"
              aria-label={`${contactContent.whatsappLabel}: ${contactInfo.phone}`}
              className={buttonClassName("whatsapp", "gap-2.5")}
            >
              <WhatsAppIcon className="size-6" />
              {contactContent.whatsappLabel}
            </a>
          </ButtonGroup>
        </div>
        <ContactForm />
      </Container>
    </Section>
  );
}
