import pantheonImageAvif from "@/assets/pantheon.avif";
import pantheonImage from "@/assets/pantheon.webp";
import eclipseImageAvif from "@/assets/eclipse.avif";
import eclipseImage from "@/assets/eclipse.webp";
import haloImageAvif from "@/assets/halo.avif";
import haloImage from "@/assets/halo.webp";
import obliqueImageAvif from "@/assets/oblique.avif";
import obliqueImage from "@/assets/oblique.webp";
import lintelImageAvif from "@/assets/lintel.avif";
import lintelImage from "@/assets/lintel.webp";
import shadowlineImageAvif from "@/assets/shadowline.avif";
import shadowlineImage from "@/assets/shadowline.webp";
import type { ProductCardProduct } from "@/components/product/ProductCard";

export type CategoryProduct = ProductCardProduct & { material: string };

export const categoryProducts: CategoryProduct[] = [
  { id: 1, name: "The Birthday Box", category: "Gift Boxes", material: "Gold", price: "£65", image: pantheonImage, imageAvif: pantheonImageAvif, isNew: true },
  { id: 2, name: "The Anniversary Box", category: "Gift Boxes", material: "Silver", price: "£85", image: eclipseImage, imageAvif: eclipseImageAvif },
  { id: 3, name: "The Mum Box", category: "Gift Boxes", material: "Rose Gold", price: "£55", image: haloImage, imageAvif: haloImageAvif, isNew: true },
  { id: 4, name: "The Just Because Box", category: "Gift Boxes", material: "Silver", price: "£45", image: obliqueImage, imageAvif: obliqueImageAvif },
  { id: 5, name: "The Luxury Box", category: "Luxury Boxes", material: "Gold", price: "£120", image: lintelImage, imageAvif: lintelImageAvif },
  { id: 6, name: "The Partner Box", category: "Gift Boxes", material: "Platinum", price: "£75", image: shadowlineImage, imageAvif: shadowlineImageAvif },
  { id: 7, name: "The Pamper Box", category: "Gift Boxes", material: "Rose Gold", price: "£58", image: pantheonImage, imageAvif: pantheonImageAvif },
  { id: 8, name: "The Date Night Box", category: "Luxury Boxes", material: "Gold", price: "£95", image: eclipseImage, imageAvif: eclipseImageAvif },
  { id: 9, name: "The Thank You Box", category: "Gift Boxes", material: "Silver", price: "£42", image: haloImage, imageAvif: haloImageAvif },
  { id: 10, name: "The New Mum Box", category: "Gift Boxes", material: "Rose Gold", price: "£68", image: obliqueImage, imageAvif: obliqueImageAvif },
  { id: 11, name: "The Wellness Box", category: "Gift Boxes", material: "Gold", price: "£52", image: lintelImage, imageAvif: lintelImageAvif },
  { id: 12, name: "The Christmas Box", category: "Luxury Boxes", material: "Platinum", price: "£110", image: shadowlineImage, imageAvif: shadowlineImageAvif },
  { id: 13, name: "The Valentine's Box", category: "Gift Boxes", material: "Gold", price: "£72", image: pantheonImage, imageAvif: pantheonImageAvif },
  { id: 14, name: "The Engagement Box", category: "Luxury Boxes", material: "Rose Gold", price: "£98", image: eclipseImage, imageAvif: eclipseImageAvif },
  { id: 15, name: "The Self-Care Box", category: "Gift Boxes", material: "Silver", price: "£48", image: haloImage, imageAvif: haloImageAvif },
  { id: 16, name: "The Bridesmaid Box", category: "Gift Boxes", material: "Rose Gold", price: "£55", image: obliqueImage, imageAvif: obliqueImageAvif },
  { id: 17, name: "The Graduation Box", category: "Gift Boxes", material: "Gold", price: "£62", image: lintelImage, imageAvif: lintelImageAvif },
  { id: 18, name: "The Corporate Box", category: "Luxury Boxes", material: "Platinum", price: "£105", image: shadowlineImage, imageAvif: shadowlineImageAvif },
  { id: 19, name: "The Get Well Box", category: "Gift Boxes", material: "Silver", price: "£50", image: pantheonImage, imageAvif: pantheonImageAvif },
  { id: 20, name: "The New Home Box", category: "Gift Boxes", material: "Gold", price: "£78", image: eclipseImage, imageAvif: eclipseImageAvif },
  { id: 21, name: "The Sister Box", category: "Gift Boxes", material: "Rose Gold", price: "£52", image: haloImage, imageAvif: haloImageAvif },
  { id: 22, name: "The Best Friend Box", category: "Gift Boxes", material: "Silver", price: "£58", image: obliqueImage, imageAvif: obliqueImageAvif },
  { id: 23, name: "The Seasonal Box", category: "Gift Boxes", material: "Gold", price: "£65", image: lintelImage, imageAvif: lintelImageAvif },
  { id: 24, name: "The Ultimate Box", category: "Luxury Boxes", material: "Platinum", price: "£150", image: shadowlineImage, imageAvif: shadowlineImageAvif },
];
