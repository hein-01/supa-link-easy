import React, { useEffect, useState } from "react";
import { useSearchParams } from "react-router-dom";
import { Navbar } from "@/components/Navbar";
import Footer from "@/components/Footer";
import { PopularBusinessCard } from "@/components/PopularBusinessCard";
import { SearchFilters } from "@/components/SearchFilters";
import { Skeleton } from "@/components/ui/skeleton";
import { useToast } from "@/hooks/use-toast";
import { supabase } from "@/integrations/supabase/client";
import { expandSearchTerms, normalizeCategoryName } from "@/utils/synonymDictionary";

interface Business {
  id: string;
  name: string;
  description?: string;
  category: string;
  address?: string;
  city?: string;
  state?: string;
  zip_code?: string;
  phone?: string;
  email?: string;
  website?: string;
  image_url?: string;
  rating: number;
  owner_id: string;
  created_at: string;
  updated_at: string;
}

export default function FindShops() {
  const [searchParams] = useSearchParams();
  const [businesses, setBusinesses] = useState<Business[]>([]);
  const [categories, setCategories] = useState<string[]>([]);
  const [loading, setLoading] = useState(true);
  const [loadingMore, setLoadingMore] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedCategory, setSelectedCategory] = useState("all");
  const [locationFilter, setLocationFilter] = useState("");
  const [currentPage, setCurrentPage] = useState(0);
  const [hasMore, setHasMore] = useState(true);
  const { toast } = useToast();

  const ITEMS_PER_PAGE = 6;

  useEffect(() => {
    fetchCategories();
    
    // Get search term from URL params
    const urlSearchTerm = searchParams.get('search');
    if (urlSearchTerm) {
      setSearchTerm(urlSearchTerm);
    }
  }, [searchParams]);

  useEffect(() => {
    setCurrentPage(0);
    setHasMore(true);
    // Only fetch if there's a search term, category filter, or location filter
    if (searchTerm || selectedCategory !== "all" || locationFilter) {
      fetchBusinesses(true);
    } else {
      setBusinesses([]);
      setLoading(false);
    }
  }, [searchTerm, selectedCategory, locationFilter]);

  const fetchCategories = async () => {
    try {
      const { data, error } = await supabase
        .from("business_categories")
        .select("name")
        .order("name");

      if (error) throw error;
      setCategories(data?.map((cat: { name: string }) => cat.name) || []);
    } catch (error) {
      console.error("Error fetching categories:", error);
    }
  };

  const fetchBusinesses = async (reset = false) => {
    try {
      if (reset) {
        setLoading(true);
        setBusinesses([]);
      } else {
        setLoadingMore(true);
      }

      const page = reset ? 0 : currentPage;
      let query = supabase
        .from("businesses")
        .select("*")
        .order("rating", { ascending: false })
        .range(page * ITEMS_PER_PAGE, (page + 1) * ITEMS_PER_PAGE - 1);

      // Apply enhanced search filter with synonyms
      if (searchTerm) {
        const expandedTerms = expandSearchTerms(searchTerm);
        const searchQuery = expandedTerms
          .map(term => `name.ilike.%${term}%,description.ilike.%${term}%,products_catalog.ilike.%${term}%`)
          .join(',');
        query = query.or(searchQuery);
      }

      // Apply category filter with normalization
      if (selectedCategory !== "all") {
        const normalizedCategory = normalizeCategoryName(selectedCategory);
        query = query.eq("category", normalizedCategory);
      }

      // Apply location filter
      if (locationFilter) {
        query = query.or(`city.ilike.%${locationFilter}%,state.ilike.%${locationFilter}%`);
      }

      const { data, error } = await query;

      if (error) throw error;
      
      const newBusinesses = data || [];
      
      if (reset) {
        setBusinesses(newBusinesses);
        setCurrentPage(0);
      } else {
        setBusinesses(prev => [...prev, ...newBusinesses]);
        setCurrentPage(page + 1);
      }
      
      setHasMore(newBusinesses.length === ITEMS_PER_PAGE);
    } catch (error) {
      console.error("Error fetching businesses:", error);
      toast({
        title: "Error",
        description: "Failed to fetch businesses. Please try again.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
      setLoadingMore(false);
    }
  };

  const handleLoadMore = () => {
    if (!loadingMore && hasMore) {
      fetchBusinesses(false);
    }
  };

  const BusinessSkeleton = () => (
    <div className="w-[280px]">
      <Skeleton className="h-[280px] w-full rounded-t-lg" />
      <div className="p-4 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-full" />
        <Skeleton className="h-3 w-2/3" />
        <div className="flex justify-between items-center mt-4">
          <Skeleton className="h-8 w-20" />
          <Skeleton className="h-8 w-16" />
        </div>
      </div>
    </div>
  );

  return (
    <div className="min-h-screen bg-background">
      <Navbar />
      
      <main className="container mx-auto px-4 pt-24 pb-8">
        <SearchFilters
          onSearchChange={setSearchTerm}
          onCategoryChange={setSelectedCategory}
          onLocationChange={setLocationFilter}
          onDeliveryFilter={(type) => {
            // Handle delivery filter logic here
            console.log("Delivery filter:", type);
          }}
          categories={categories}
          initialSearchTerm={searchTerm}
          initialCategory={selectedCategory}
        />

        <div className="mt-8">
          <div className="flex flex-wrap justify-center gap-5 max-w-[580px] md:max-w-[580px] lg:max-w-[900px] mx-auto">
            {loading ? (
              // Show skeletons while loading
              Array.from({ length: 6 }).map((_, index) => (
                <BusinessSkeleton key={index} />
              ))
            ) : businesses.length > 0 ? (
              businesses.map((business) => (
                <PopularBusinessCard key={business.id} business={business} />
              ))
            ) : (
              <div className="text-center py-12 w-full">
                <p className="text-xl text-muted-foreground">
                  No businesses found matching your criteria.
                </p>
                <p className="text-muted-foreground mt-2">
                  Try adjusting your search filters or browse all categories.
                </p>
              </div>
            )}
          </div>
          
          {!loading && businesses.length > 0 && hasMore && (
            <div className="flex justify-center mt-8">
              <button
                onClick={handleLoadMore}
                disabled={loadingMore}
                className="px-8 py-3 bg-primary text-primary-foreground rounded-lg border-2 border-primary shadow-lg hover:shadow-xl hover:bg-primary/90 hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:hover:scale-100 transition-all duration-200"
              >
                {loadingMore ? "Loading..." : "Load More"}
              </button>
            </div>
          )}
        </div>
      </main>

      <Footer />
    </div>
  );
}