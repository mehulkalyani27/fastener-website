import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { ButtonLink } from "@/components/ui/button-link";
import { SectionHeader } from "@/components/ui/section-header";
import { contactContent } from "@/data/home";
import { contactInfo } from "@/data/site";

export function ContactSection() {
  const details = [
    { label: "Address", value: contactInfo.address.join(", ") },
    { label: "Email", value: contactInfo.email },
    { label: "Phone", value: contactInfo.phone },
    { label: "Business Hours", value: contactInfo.hours },
  ];

  return (
    <Section id="contact" tone="surface" aria-labelledby="contact-title">
      <Container>
        <SectionHeader
          id="contact-title"
          title={contactContent.title}
          description={contactContent.description}
        />
        <address className="grid-auto-fit mt-10 grid gap-6 not-italic">
          {details.map((detail) => (
            <div
              key={detail.label}
              className="rounded-lg border border-border bg-background p-6"
            >
              <p className="text-sm text-muted">{detail.label}</p>
              <p className="mt-1 font-semibold">{detail.value}</p>
            </div>
          ))}
        </address>
        <ButtonLink href={`mailto:${contactInfo.email}`} className="mt-10">
          {contactContent.inquiryLabel}
        </ButtonLink>
      </Container>
    </Section>
  );
}
