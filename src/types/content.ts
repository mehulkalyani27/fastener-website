export type NavItem = {
  label: string;
  href: string;
};

export type ContentItem = {
  title: string;
  description: string;
};

export type ProductCategory = {
  slug: string;
  name: string;
  description: string;
};

export type Industry = {
  slug: string;
  name: string;
  description: string;
  applications: string[];
};

export type SocialLink = {
  label: string;
  href?: string;
};
