import { useState, useEffect, cloneElement, isValidElement } from "react";
import { X } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { Label } from "@/components/ui/label";
import {
  Carousel,
  CarouselContent,
  CarouselItem,
} from "@/components/ui/carousel";

interface FiltersModalProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onLocationChange: (location: string) => void;
  onProductChange?: (product: string) => void;
  categories: string[];
  initialSearchTerm?: string;
  initialCategory?: string;
  initialProduct?: string;
  children: React.ReactNode;
}

export const FiltersModal = ({
  onSearchChange,
  onCategoryChange,
  onLocationChange,
  onProductChange,
  categories,
  initialSearchTerm = "",
  initialCategory = "all",
  initialProduct = "all",
  children,
}: FiltersModalProps) => {
  const [open, setOpen] = useState(false);
  const [category, setCategory] = useState(initialCategory);
  const [product, setProduct] = useState(initialProduct);

  // Category to products mapping
  const categoryProducts: Record<string, string[]> = {
    "all": ["All Products"],
    "Restaurant": ["Fast Food", "Fine Dining", "Takeaway", "Delivery"],
    "Retail": ["Clothing", "Electronics", "Home & Garden", "Books"],
    "Service": ["Consultation", "Repair", "Maintenance", "Installation"],
    "Healthcare": ["Check-up", "Treatment", "Prescription", "Emergency"],
    "Beauty": ["Haircut", "Manicure", "Facial", "Massage"],
    "Automotive": ["Car Wash", "Oil Change", "Tire Service", "Repair"],
    "Entertainment": ["Movies", "Games", "Events", "Sports"],
    "Education": ["Courses", "Tutoring", "Training", "Workshops"],
    "Technology": ["Software", "Hardware", "Support", "Development"],
    "Finance": ["Banking", "Insurance", "Investment", "Loans"],
  };

  const currentProducts = categoryProducts[category] || ["All Products"];

  // Check if filters are active
  const isFiltersActive = category !== "all" || (product !== "all" && product !== "All Products");

  useEffect(() => {
    // Reset product selection when category changes
    if (category === "all") {
      setProduct("all");
    } else if (currentProducts.length > 0) {
      setProduct(currentProducts[0]);
    }
  }, [category]);

  const handleSearch = () => {
    onCategoryChange(category);
    onProductChange?.(product);
    setOpen(false);
  };

  const handleReset = () => {
    setCategory("all");
    setProduct("all");
    onCategoryChange("all");
    onProductChange?.("all");
  };

  // Clone children to add active styling
  const triggerButton = isValidElement(children) 
    ? cloneElement(children, {
        ...children.props,
        className: `${children.props.className || ""} ${
          isFiltersActive 
            ? "border-purple-500 bg-purple-50 text-purple-700 hover:bg-purple-100" 
            : ""
        }`.trim()
      })
    : children;

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {triggerButton}
      </DialogTrigger>
      <DialogContent className="sm:max-w-md bg-white rounded-lg shadow-2xl border-0 max-h-[90vh] overflow-hidden [&>button]:bg-purple-200 [&>button]:hover:bg-purple-300 [&>button]:rounded-full [&>button]:opacity-100 [&>button>svg]:text-purple-700">
        <DialogHeader className="pb-4 border-b border-gray-100">
          <DialogTitle className="text-xl font-bold text-foreground">
            Search filters
          </DialogTitle>
        </DialogHeader>

        <div className="flex flex-col min-h-0 overflow-hidden">
          <div className="py-4 px-1 space-y-6">
            {/* Category Section */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Category
              </Label>
              <div className="w-full overflow-hidden">
                <Carousel
                  opts={{
                    align: "start",
                    dragFree: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2">
                    <CarouselItem className="pl-2 basis-auto">
                      <button
                        type="button"
                        onClick={() => setCategory("all")}
                        className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm whitespace-nowrap ${
                          category === "all"
                            ? "bg-blue-100 text-blue-700 shadow-md"
                            : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm"
                        }`}
                      >
                        Any
                      </button>
                    </CarouselItem>
                    {categories.map((cat) => (
                      <CarouselItem key={cat} className="pl-2 basis-auto">
                        <button
                          type="button"
                          onClick={() => setCategory(cat)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm whitespace-nowrap ${
                            category === cat
                              ? "bg-blue-100 text-blue-700 shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm"
                          }`}
                        >
                          {cat}
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            </div>

            {/* Products Section */}
            <div className="space-y-4">
              <Label className="text-sm font-medium text-gray-700">
                Products
              </Label>
              <div className="w-full overflow-hidden">
                <Carousel
                  opts={{
                    align: "start",
                    dragFree: true,
                  }}
                  className="w-full"
                >
                  <CarouselContent className="-ml-2">
                    {currentProducts.map((prod) => (
                      <CarouselItem key={prod} className="pl-2 basis-auto">
                        <button
                          type="button"
                          onClick={() => setProduct(prod)}
                          className={`px-4 py-2 rounded-lg text-sm font-medium transition-all duration-200 shadow-sm whitespace-nowrap ${
                            product === prod
                              ? "bg-blue-100 text-blue-700 shadow-md"
                              : "bg-gray-100 text-gray-700 hover:bg-gray-200 shadow-sm"
                          }`}
                        >
                          {prod}
                        </button>
                      </CarouselItem>
                    ))}
                  </CarouselContent>
                </Carousel>
              </div>
            </div>
          </div>

          <div className="flex gap-3 pt-4 border-t border-gray-100 px-1">
            <Button
              type="button"
              variant="outline"
              className="flex-1 border-gray-200 hover:bg-gray-50"
              onClick={handleReset}
            >
              Reset
            </Button>
            <Button
              type="button"
              className="flex-1 bg-primary hover:bg-primary/90"
              onClick={handleSearch}
            >
              Search
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};