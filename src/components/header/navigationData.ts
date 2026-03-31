import { buildVersionedUrl } from "@/lib/versionSync";

export interface NavigationImage {
  alt: string;
  avifSrc?: string;
  label: string;
  src: string;
}

export interface NavigationItem {
  href: string;
  images: NavigationImage[];
  name: string;
  submenuItems: string[];
}

const toSlug = (value: string) => value.toLowerCase().replace(/\s+/g, "-");

export const popularSearches = [
  "Birthday Gift",
  "Anniversary Box",
  "Gift for Mum",
  "Personalised Box",
  "Luxury Gift Set",
  "Last Minute Gift",
];

export const navItems: NavigationItem[] = [
  {
    name: "Shop",
    href: "/category/shop",
    submenuItems: [
      "For Her Birthday",
      "For Mum",
      "For Partner",
      "Anniversary",
      "Just Because",
    ],
    images: [
      {
        avifSrc: buildVersionedUrl("/rings-collection.avif"),
        src: buildVersionedUrl("/rings-collection.webp"),
        alt: "Birthday Gift Box",
        label: "Birthday Boxes",
      },
      {
        avifSrc: buildVersionedUrl("/earrings-collection.avif"),
        src: buildVersionedUrl("/earrings-collection.webp"),
        alt: "Anniversary Gift Box",
        label: "Anniversary Boxes",
      },
    ],
  },
  {
    name: "New in",
    href: "/category/new-in",
    submenuItems: [
      "This Week's Boxes",
      "Seasonal Collection",
      "Limited Edition",
      "Personalised",
      "Best Sellers",
    ],
    images: [
      {
        avifSrc: buildVersionedUrl("/arcus-bracelet.avif"),
        src: buildVersionedUrl("/arcus-bracelet.webp"),
        alt: "New Gift Box",
        label: "Spring Collection",
      },
      {
        avifSrc: buildVersionedUrl("/span-bracelet.avif"),
        src: buildVersionedUrl("/span-bracelet.webp"),
        alt: "Limited Edition Box",
        label: "Limited Edition",
      },
    ],
  },
  {
    name: "About",
    href: "/about/our-story",
    submenuItems: [
      "Our Story",
      "Sustainability",
      "Gift Guide",
      "Customer Care",
      "Store Locator",
    ],
    images: [
      {
        avifSrc: buildVersionedUrl("/founders.avif"),
        src: buildVersionedUrl("/founders.webp"),
        alt: "The GOOJ Story",
        label: "Read our story",
      },
    ],
  },
];

export const getNavigationFeatureHref = (item: NavigationItem) => item.href;

export const getNavigationSubmenuHref = (item: NavigationItem, subItem: string) => {
  return item.name === "About" ? `/about/${toSlug(subItem)}` : `/category/${toSlug(subItem)}`;
};
