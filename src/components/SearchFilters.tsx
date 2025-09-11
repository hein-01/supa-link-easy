import { useState, useEffect } from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Card } from "@/components/ui/card";
import { Search, Filter, Truck, Store, MapPin } from "lucide-react";
import { FiltersModal } from "./FiltersModal";
import { LocationsModal } from "./LocationsModal";

interface SearchFiltersProps {
  onSearchChange: (search: string) => void;
  onCategoryChange: (category: string) => void;
  onLocationChange: (location: string) => void;
  onDeliveryFilter?: (type: string) => void;
  categories: string[];
  initialSearchTerm?: string;
  initialCategory?: string;
}

export const SearchFilters = ({
  onSearchChange,
  onCategoryChange,
  onLocationChange,
  onDeliveryFilter,
  categories,
  initialSearchTerm = "",
  initialCategory = "all",
}: SearchFiltersProps) => {
  const [search, setSearch] = useState(initialSearchTerm);
  const [selectedDelivery, setSelectedDelivery] = useState<string[]>([]);

  useEffect(() => {
    setSearch(initialSearchTerm);
  }, [initialSearchTerm]);

  const handleSearchSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSearchChange(search);
  };

  return (
    <Card className="p-6 mb-6 shadow-lg border-2 hover:shadow-xl transition-all duration-300 bg-gradient-to-br from-background to-muted/30">
      <div className="space-y-4">
        <div className="flex items-center gap-2 text-lg font-semibold text-primary">
          <Filter className="h-5 w-5" />
          Search & Filters
        </div>
        
        <div className="space-y-4">
          {/* Search with Filters and Search buttons */}
          <div className="flex gap-2">
            <form onSubmit={handleSearchSubmit} className="relative flex-1">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
              <Input
                placeholder="Search businesses..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-10 border-2 shadow-sm hover:shadow-md focus:shadow-lg focus:border-purple-500 focus-visible:ring-2 focus-visible:ring-purple-500/20 transition-all duration-200"
              />
            </form>
            
            <LocationsModal onLocationChange={onLocationChange}>
              <Button 
                type="button" 
                variant="outline"
                className="border-2 shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <MapPin className="h-4 w-4 mr-2" />
                Locations
              </Button>
            </LocationsModal>
            
            <FiltersModal
              onSearchChange={onSearchChange}
              onCategoryChange={onCategoryChange}
              onLocationChange={onLocationChange}
              categories={categories}
              initialSearchTerm={initialSearchTerm}
              initialCategory={initialCategory}
            >
              <Button 
                type="button" 
                variant="outline"
                className="border-2 shadow-md hover:shadow-lg transition-shadow duration-200"
              >
                <Filter className="h-4 w-4 mr-2" />
                Filters
              </Button>
            </FiltersModal>
            
            <Button 
              type="button" 
              onClick={() => handleSearchSubmit(new Event('submit') as any)}
              className="shadow-md hover:shadow-lg transition-shadow duration-200"
            >
              Search
            </Button>
          </div>
          
          {/* Centered delivery and filter buttons */}
          <div className="flex flex-wrap justify-center gap-2">
            <Button 
              type="button" 
              variant="outline" 
              className={`border-2 shadow-md hover:shadow-lg transition-all duration-200 ${
                selectedDelivery.includes("cash_on_delivery") 
                  ? "text-green-700 border-green-500 bg-green-50" 
                  : "hover:text-green-700 hover:border-green-500 hover:bg-green-50"
              }`}
              onClick={() => {
                const newSelection = selectedDelivery.includes("cash_on_delivery")
                  ? selectedDelivery.filter(item => item !== "cash_on_delivery")
                  : [...selectedDelivery, "cash_on_delivery"];
                setSelectedDelivery(newSelection);
                onDeliveryFilter?.(newSelection.join(","));
              }}
            >
              <Truck className="h-4 w-4 mr-2" />
              Cash on Delivery
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className={`border-2 shadow-md hover:shadow-lg transition-all duration-200 ${
                selectedDelivery.includes("store_pickup") 
                  ? "text-blue-700 border-blue-500 bg-blue-50" 
                  : "hover:text-blue-700 hover:border-blue-500 hover:bg-blue-50"
              }`}
              onClick={() => {
                const newSelection = selectedDelivery.includes("store_pickup")
                  ? selectedDelivery.filter(item => item !== "store_pickup")
                  : [...selectedDelivery, "store_pickup"];
                setSelectedDelivery(newSelection);
                onDeliveryFilter?.(newSelection.join(","));
              }}
            >
              <Store className="h-4 w-4 mr-2" />
              Store Pick Up
            </Button>
            
            <Button 
              type="button" 
              variant="outline" 
              className="border-2 shadow-md hover:shadow-lg transition-shadow duration-200"
              onClick={() => {
                setSearch("");
                setSelectedDelivery([]);
                onSearchChange("");
                onLocationChange("");
                onCategoryChange("all");
              }}
            >
              Clear Filters
            </Button>
          </div>
        </div>
      </div>
    </Card>
  );
};