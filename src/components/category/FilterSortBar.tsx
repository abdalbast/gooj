import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetDescription,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { SHOPPER_PRICE_RANGES } from "@/lib/commerce";

export type SortOption = "featured" | "price-low" | "price-high" | "name";

interface FilterSortBarProps {
  categories: string[];
  filtersOpen: boolean;
  materials: string[];
  onClearFilters: () => void;
  onSortChange: (value: SortOption) => void;
  onToggleCategory: (category: string, checked: boolean) => void;
  onToggleMaterial: (material: string, checked: boolean) => void;
  onTogglePriceRange: (range: string, checked: boolean) => void;
  selectedCategories: string[];
  selectedMaterials: string[];
  selectedPriceRanges: string[];
  setFiltersOpen: (open: boolean) => void;
  sortBy: SortOption;
  itemCount: number;
}

const FilterSortBar = ({
  categories,
  filtersOpen,
  materials,
  onClearFilters,
  onSortChange,
  onToggleCategory,
  onToggleMaterial,
  onTogglePriceRange,
  selectedCategories,
  selectedMaterials,
  selectedPriceRanges,
  setFiltersOpen,
  sortBy,
  itemCount,
}: FilterSortBarProps) => {
  return (
    <>
      <section className="w-full px-6 mb-8 border-b border-border pb-4">
        <div className="flex justify-between items-center">
          <p className="text-sm font-light text-muted-foreground">
            {itemCount} items
          </p>
          
          <div className="flex items-center gap-4">
            <Sheet open={filtersOpen} onOpenChange={setFiltersOpen}>
              <SheetTrigger asChild>
                <Button 
                  variant="ghost" 
                  size="sm"
                  className="font-light hover:bg-transparent"
                >
                  Filters
                </Button>
              </SheetTrigger>
              <SheetContent
                side="right"
                className="w-80 max-w-[calc(100vw-var(--safe-area-left)-var(--safe-area-right))] border-none bg-background shadow-none"
              >
                <SheetHeader className="mb-6 border-b border-border pb-4">
                  <SheetTitle className="text-lg font-light">Filters</SheetTitle>
                  <SheetDescription className="sr-only">
                    Filter products by category, price, and material.
                  </SheetDescription>
                </SheetHeader>
                
                <div className="space-y-8">
                  {/* Category Filter */}
                  <div>
                    <h3 className="text-sm font-light mb-4 text-foreground">Category</h3>
                    <div className="space-y-3">
                      {categories.map((category) => (
                        <div key={category} className="flex min-h-11 items-center space-x-3">
                          <Checkbox
                            checked={selectedCategories.includes(category)}
                            className="border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                            id={category}
                            onCheckedChange={(checked) => onToggleCategory(category, checked === true)}
                          />
                          <Label htmlFor={category} className="text-sm font-light text-foreground cursor-pointer">
                            {category}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="border-border" />

                  {/* Price Filter */}
                  <div>
                    <h3 className="text-sm font-light mb-4 text-foreground">Price</h3>
                    <div className="space-y-3">
                      {SHOPPER_PRICE_RANGES.map((range) => (
                        <div key={range} className="flex min-h-11 items-center space-x-3">
                          <Checkbox
                            checked={selectedPriceRanges.includes(range)}
                            className="border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                            id={range}
                            onCheckedChange={(checked) => onTogglePriceRange(range, checked === true)}
                          />
                          <Label htmlFor={range} className="text-sm font-light text-foreground cursor-pointer">
                            {range}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="border-border" />

                  {/* Material Filter */}
                  <div>
                    <h3 className="text-sm font-light mb-4 text-foreground">Material</h3>
                    <div className="space-y-3">
                      {materials.map((material) => (
                        <div key={material} className="flex min-h-11 items-center space-x-3">
                          <Checkbox
                            checked={selectedMaterials.includes(material)}
                            className="border-border data-[state=checked]:bg-foreground data-[state=checked]:border-foreground"
                            id={material}
                            onCheckedChange={(checked) => onToggleMaterial(material, checked === true)}
                          />
                          <Label htmlFor={material} className="text-sm font-light text-foreground cursor-pointer">
                            {material}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <Separator className="border-border" />

                  <div className="flex flex-col gap-2 pt-4">
                    <Button
                      className="w-full border-none hover:bg-transparent hover:underline font-normal text-left justify-start"
                      onClick={() => setFiltersOpen(false)}
                      size="sm"
                      variant="ghost"
                    >
                      Apply Filters
                    </Button>
                    <Button
                      className="w-full border-none hover:bg-transparent hover:underline font-light text-left justify-start"
                      onClick={onClearFilters}
                      size="sm"
                      variant="ghost"
                    >
                      Clear All
                    </Button>
                  </div>
                </div>
              </SheetContent>
            </Sheet>

            <Select value={sortBy} onValueChange={onSortChange}>
              <SelectTrigger className="w-auto border-none bg-transparent text-sm font-light shadow-none rounded-none pr-2">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="shadow-none border-none rounded-none bg-background">
                <SelectItem value="featured" className="hover:bg-transparent hover:underline data-[state=checked]:bg-transparent data-[state=checked]:underline pl-2 [&>span:first-child]:hidden">Featured</SelectItem>
                <SelectItem value="price-low" className="hover:bg-transparent hover:underline data-[state=checked]:bg-transparent data-[state=checked]:underline pl-2 [&>span:first-child]:hidden">Price: Low to High</SelectItem>
                <SelectItem value="price-high" className="hover:bg-transparent hover:underline data-[state=checked]:bg-transparent data-[state=checked]:underline pl-2 [&>span:first-child]:hidden">Price: High to Low</SelectItem>
                <SelectItem value="name" className="hover:bg-transparent hover:underline data-[state=checked]:bg-transparent data-[state=checked]:underline pl-2 [&>span:first-child]:hidden">Name A-Z</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>
      </section>
    </>
  );
};

export default FilterSortBar;
