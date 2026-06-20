export type Note = {
  slug: string;
  title: string;
  date: string;
  teaser: string;
  body: string[];
};

export const notes: Note[] = [
  {
    slug: "why-products-should-explain-before-they-ask",
    title: "Why products should explain before they ask",
    date: "2026-06-20",
    teaser: "A note on earning trust through context before action.",
    body: [
      "A product should not rush someone into a decision before the decision is clear.",
      "Good interfaces explain what is happening, what can be trusted, and what action is being asked for.",
      "That does not mean adding more text everywhere. It means giving the right context at the moment it matters.",
      "For @nodedots, the operating principle stays simple: explain first, then invite action.",
    ],
  },
  {
    slug: "small-tools-for-high-trust-moments",
    title: "Small tools for high-trust moments",
    date: "2026-06-20",
    teaser: "How links, tabs, and AI decisions become clearer with less noise.",
    body: [
      "Small tools can matter most when the decision carries uncertainty.",
      "A link asks for trust. A browser session asks for direction. An AI result asks for judgment.",
      "The job of the tool is not to take over the decision. The job is to make the tradeoffs easier to see.",
      "That is the space @nodedots keeps returning to: narrow tools for moments where clarity changes what happens next.",
    ],
  },
  {
    slug: "designing-for-practical-clarity",
    title: "Designing for practical clarity",
    date: "2026-06-20",
    teaser: "A working principle for copy, layout, and product behavior.",
    body: [
      "Practical clarity is not a visual style. It is a product behavior.",
      "It shows up in fewer competing actions, plain labels, visible status, and copy that does not hide the point.",
      "A clear interface helps someone understand where they are, what changed, and what they can do next.",
      "The less a product needs to perform intelligence, the more room it has to be useful.",
    ],
  },
];

export function getNoteBySlug(slug: string) {
  return notes.find((note) => note.slug === slug);
}
