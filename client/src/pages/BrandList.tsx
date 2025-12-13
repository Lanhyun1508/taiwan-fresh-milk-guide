import { useState, useMemo } from "react";
import { trpc } from "@/lib/trpc";
import { MilkBrand } from "@shared/types";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { BrandCard } from "@/components/BrandCard";
import { FilterPanel, FilterState } from "@/components/FilterPanel";
import { ComparePanel } from "@/components/ComparePanel";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { Skeleton } from "@/components/ui/skeleton";
import { Search, SlidersHorizontal, LayoutGrid, List, Milk } from "lucide-react";

export default function BrandList() {
  const [filters, setFilters] = useState<FilterState>({
    search: "",
    pasteurizationType: [],
    physicalChannels: [],
    onlineChannels: [],
  });
  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [viewMode, setViewMode] = useState<"grid" | "list">("grid");

  const { data: brands, isLoading } = trpc.brands.list.useQuery(filters);
  const { data: filterOptions } = trpc.brands.getFilterOptions.useQuery();

  const selectedBrands = useMemo(() => {
    if (!brands) return [];
    return brands.filter((b) => selectedIds.includes(b.id));
  }, [brands, selectedIds]);

  const handleSelect = (id: number, selected: boolean) => {
    if (selected) {
      if (selectedIds.length < 5) {
        setSelectedIds([...selectedIds, id]);
      }
    } else {
      setSelectedIds(selectedIds.filter((i) => i !== id));
    }
  };

  const handleRemove = (id: number) => {
    setSelectedIds(selectedIds.filter((i) => i !== id));
  };

  const handleClear = () => {
    setSelectedIds([]);
  };

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container">
          {/* Page Header */}
          <div className="mb-8">
            <p className="label-caps mb-2">Brand Database</p>
            <h1 className="text-3xl md:text-4xl">品牌列表</h1>
            <p className="text-muted-foreground mt-2">
              {isLoading
                ? "載入中..."
                : `共 ${brands?.length || 0} 個品牌`}
            </p>
          </div>

          <div className="flex gap-8">
            {/* Desktop Filter Sidebar */}
            <aside className="hidden lg:block w-64 shrink-0">
              <div className="sticky top-24">
                <FilterPanel
                  filters={filters}
                  onFiltersChange={setFilters}
                  availablePhysicalChannels={filterOptions?.physicalChannels}
                  availableOnlineChannels={filterOptions?.onlineChannels}
                />
              </div>
            </aside>

            {/* Main Content */}
            <div className="flex-1 min-w-0">
              {/* Toolbar */}
              <div className="flex items-center gap-4 mb-6">
                {/* Search */}
                <div className="relative flex-1 max-w-md">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                  <Input
                    placeholder="搜尋品牌或產品..."
                    value={filters.search}
                    onChange={(e) =>
                      setFilters({ ...filters, search: e.target.value })
                    }
                    className="pl-10"
                  />
                </div>

                {/* Mobile Filter Button */}
                <Sheet>
                  <SheetTrigger asChild>
                    <Button variant="outline" size="icon" className="lg:hidden">
                      <SlidersHorizontal className="w-4 h-4" />
                    </Button>
                  </SheetTrigger>
                  <SheetContent side="left" className="w-80">
                    <SheetHeader>
                      <SheetTitle>篩選條件</SheetTitle>
                    </SheetHeader>
                    <div className="mt-6">
                      <FilterPanel
                        filters={filters}
                        onFiltersChange={setFilters}
                        availablePhysicalChannels={filterOptions?.physicalChannels}
                        availableOnlineChannels={filterOptions?.onlineChannels}
                      />
                    </div>
                  </SheetContent>
                </Sheet>

                {/* View Mode Toggle */}
                <div className="hidden sm:flex items-center border border-border rounded-md">
                  <Button
                    variant={viewMode === "grid" ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-r-none"
                    onClick={() => setViewMode("grid")}
                  >
                    <LayoutGrid className="w-4 h-4" />
                  </Button>
                  <Button
                    variant={viewMode === "list" ? "secondary" : "ghost"}
                    size="icon"
                    className="rounded-l-none"
                    onClick={() => setViewMode("list")}
                  >
                    <List className="w-4 h-4" />
                  </Button>
                </div>
              </div>

              {/* Compare Hint */}
              {selectedIds.length === 0 && (
                <p className="text-sm text-muted-foreground mb-4">
                  選擇 2-5 個品牌進行比較
                </p>
              )}

              {/* Brand Grid/List */}
              {isLoading ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div key={i} className="space-y-4">
                      <Skeleton className="aspect-[4/3] w-full" />
                      <Skeleton className="h-4 w-20" />
                      <Skeleton className="h-6 w-3/4" />
                      <Skeleton className="h-4 w-1/2" />
                    </div>
                  ))}
                </div>
              ) : brands?.length === 0 ? (
                <div className="text-center py-16">
                  <Milk className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
                  <h3 className="text-lg font-medium mb-2">找不到符合條件的品牌</h3>
                  <p className="text-muted-foreground">
                    請嘗試調整篩選條件或搜尋關鍵字
                  </p>
                </div>
              ) : viewMode === "grid" ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-6">
                  {brands?.map((brand) => (
                    <BrandCard
                      key={brand.id}
                      brand={brand}
                      showCheckbox
                      isSelected={selectedIds.includes(brand.id)}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              ) : (
                <div className="space-y-4">
                  {brands?.map((brand) => (
                    <BrandListItem
                      key={brand.id}
                      brand={brand}
                      isSelected={selectedIds.includes(brand.id)}
                      onSelect={handleSelect}
                    />
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>
      </main>

      {/* Compare Panel */}
      <ComparePanel
        selectedBrands={selectedBrands}
        onRemove={handleRemove}
        onClear={handleClear}
      />

      <Footer />
    </div>
  );
}

// List view item component
function BrandListItem({
  brand,
  isSelected,
  onSelect,
}: {
  brand: MilkBrand;
  isSelected: boolean;
  onSelect: (id: number, selected: boolean) => void;
}) {
  return (
    <div className="flex items-center gap-4 p-4 border border-border bg-card hover:shadow-sm transition-shadow">
      <input
        type="checkbox"
        checked={isSelected}
        onChange={(e) => onSelect(brand.id, e.target.checked)}
        className="w-5 h-5"
      />
      <div className="w-16 h-16 bg-muted/30 shrink-0 flex items-center justify-center">
        {brand.imageUrl ? (
          <img
            src={brand.imageUrl}
            alt={brand.productName}
            className="w-full h-full object-contain"
          />
        ) : (
          <Milk className="w-6 h-6 text-muted-foreground/30" />
        )}
      </div>
      <div className="flex-1 min-w-0">
        <p className="label-caps">{brand.brandName}</p>
        <h3 className="font-medium truncate">{brand.productName}</h3>
      </div>
      <span className={`pasteurization-badge ${brand.pasteurizationType.toLowerCase()} shrink-0`}>
        {brand.pasteurizationType}
      </span>
      <div className="text-right shrink-0">
        <p className="font-medium">
          {brand.price ? `NT$${brand.price}` : "—"}
        </p>
        <p className="text-sm text-muted-foreground">
          {brand.volume >= 1000
            ? `${brand.volume / 1000}L`
            : `${brand.volume}ml`}
        </p>
      </div>
    </div>
  );
}
