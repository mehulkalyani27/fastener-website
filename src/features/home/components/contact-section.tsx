import { Container } from "@/components/layout/container";
import { Section } from "@/components/layout/section";
import { Button } from "@/components/ui/button";
import { TextAreaField, TextField } from "@/components/ui/form-field";
import { SectionHeader } from "@/components/ui/section-header";
import { contactContent } from "@/data/home";

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

        <form
          aria-labelledby="contact-title"
          data-reveal
          className="grid gap-x-5 gap-y-6 rounded-card border border-border bg-background p-5 shadow-raised sm:grid-cols-2 sm:p-8 lg:p-10"
        >
          <TextField id="name" label="Name" autoComplete="name" />
          <TextField id="phone" label="Phone" type="tel" autoComplete="tel" />
          <TextField id="email" label="Email" type="email" autoComplete="email" className="sm:col-span-2" />
          <TextAreaField
            id="message"
            label="Message"
            placeholder="Steel thickness, application, or anything else we should know"
            className="sm:col-span-2"
          />
          <div className="flex flex-col gap-3 pt-2 sm:col-span-2 sm:flex-row sm:items-center sm:gap-5">
            <Button disabled className="w-full sm:w-auto">
              {contactContent.submitLabel}
            </Button>
          </div>
        </form>
      </Container>
    </Section>
  );
}
