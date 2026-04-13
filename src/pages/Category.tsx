import { useMemo, useState } from "react";
import { useParams } from "react-router-dom";
import Header from "../components/header/Header";
import Footer from "../components/footer/Footer";
import CategoryHeader from "../components/category/CategoryHeader";
import FilterSortBar, { type SortOption } from "../components/category/FilterSortBar";
import ProductGrid from "../components/category/ProductGrid";
import { categoryProducts } from "../components/category/productData";
import { parseGBPValue } from "@/lib/commerce";

const normalizeCategoryParam = (value: string) =>
  value
    .split("-")
    .map((segment) => segment.charAt(0).toUpperCase() + segment.slice(1))
    .join(" ");

const Category = () => {
  const { category } = useParams();
  const [filtersOpen, setFiltersOpen] = useState(false);
  const [sortBy, setSortBy] = useState<SortOption>("featured");
  const [selectedCategories, setSelectedCategories] = useState<string[]>([]);
  const [selectedMaterials, setSelectedMaterials] = useState<string[]>([]);
  const [selectedPriceRanges, setSelectedPriceRanges] = useState<string[]>([]);

  const filterableCategories = useMemo(
    () => [...new Set(categoryProducts.map((product) => product.category))],
    [],
  );
  const materials = useMemo(
    () => [...new Set(categoryProducts.map((product) => product.material))],
    [],
  );

  const title = category ? normalizeCategoryParam(category) : "All Products";

  const filteredAndSortedProducts = useMemo(() => {
    const matchesRouteCategory = (productCategory: string) =>
      !category ||
      productCategory.toLowerCase().includes(category.replaceAll("-", " ").toLowerCase());

    const matchesPriceRange = (price: number) => {
      if (selectedPriceRanges.length === 0) {
        return true;
      }

      return selectedPriceRanges.some((range) => {
        if (range === "Under £50") {
          return price < 50;
        }
        if (range === "£50-£75") {
          return price >= 50 && price <= 75;
        }
        if (range === "£75-£100") {
          return price > 75 && price <= 100;
        }
        if (range === "£100+") {
          return price > 100;
        }
        return true;
      });
    };

    const filtered = categoryProducts.filter((product) => {
      if (!matchesRouteCategory(product.category)) {
        return false;
      }

      if (
        selectedCategories.length > 0 &&
        !selectedCategories.includes(product.category)
      ) {
        return false;
      }

      if (selectedMaterials.length > 0 && !selectedMaterials.includes(product.material)) {
        return false;
      }

      return matchesPriceRange(parseGBPValue(product.price));
    });

    return [...filtered].sort((a, b) => {
      const priceA = parseGBPValue(a.price);
      const priceB = parseGBPValue(b.price);

      switch (sortBy) {
        case "price-low":
          return priceA - priceB;
        case "price-high":
          return priceB - priceA;
        case "name":
          return a.name.localeCompare(b.name);
        default:
          return a.id - b.id;
      }
    });
  }, [category, selectedCategories, selectedMaterials, selectedPriceRanges, sortBy]);

  const updateSelection = (
    current: string[],
    value: string,
    checked: boolean,
    setSelection: (next: string[]) => void,
  ) => {
    setSelection(checked ? [...current, value] : current.filter((item) => item !== value));
  };

  const clearFilters = () => {
    setSelectedCategories([]);
    setSelectedMaterials([]);
    setSelectedPriceRanges([]);
  };

  return (
    <div className="min-h-screen bg-background">
      <Header />
      
      <main className="pt-6">
        <CategoryHeader category={title} />
        
        <FilterSortBar
          categories={filterableCategories}
          filtersOpen={filtersOpen}
          itemCount={filteredAndSortedProducts.length}
          materials={materials}
          onClearFilters={clearFilters}
          onSortChange={setSortBy}
          onToggleCategory={(value, checked) =>
            updateSelection(selectedCategories, value, checked, setSelectedCategories)
          }
          onToggleMaterial={(value, checked) =>
            updateSelection(selectedMaterials, value, checked, setSelectedMaterials)
          }
          onTogglePriceRange={(value, checked) =>
            updateSelection(selectedPriceRanges, value, checked, setSelectedPriceRanges)
          }
          selectedCategories={selectedCategories}
          selectedMaterials={selectedMaterials}
          selectedPriceRanges={selectedPriceRanges}
          setFiltersOpen={setFiltersOpen}
          sortBy={sortBy}
        />
        
        <ProductGrid products={filteredAndSortedProducts} />
      </main>
      
      <Footer />
    </div>
  );
};

export default Category;