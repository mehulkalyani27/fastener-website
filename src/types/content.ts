export type NavItem = {
  label: string;
  href: string;
};

export type ThreadPanel = {
  label: string;
  word: string;
  line: string;
  /** Side of the stage the title occupies (and enters from). */
  side: "left" | "right";
  /** Row of the stage the title sits in; follows the free space as the fastener rises. */
  row: "top" | "bottom";
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
  /** Optional short tags for example applications. */
  applications?: string[];
};

/** Text for one chapter of the Industries 3D story — describes the visualization, not product specs. */
export type IndustryStoryChapter = {
  slug: string;
  application: string;
  why: string;
  /** Step captions keyed as in the chapter's scene timeline. */
  captions: Record<string, string>;
};

export type SocialLink = {
  label: string;
  href?: string;
};
