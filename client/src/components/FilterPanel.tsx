import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Checkbox } from "@/components/ui/checkbox";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Slider } from "@/components/ui/slider";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import { ChevronDown, X } from "lucide-react";
import {
  PASTEURIZATION_LABELS,
  PHYSICAL_CHANNELS,
  ONLINE_CHANNELS,
  type PasteurizationType,
} from "@shared/milkConstants";

export interface FilterState {
  search: string;
  pasteurizationType: PasteurizationType[];
  physicalChannels: string[];
  onlineChannels: string[];
  minPrice?: number;
  maxPrice?: number;
  isOrganic?: boolean;
  isImported?: boolean;
}

interface FilterPanelProps {
  filters: FilterState;
  onFiltersChange: (filters: FilterState) => void;
  availablePhysicalChannels?: string[];
  availableOnlineChannels?: string[];
}

export function FilterPanel({
  filters,
  onFiltersChange,
  availablePhysicalChannels = [...PHYSICAL_CHANNELS],
  availableOnlineChannels = [...ONLINE_CHANNELS],
}: FilterPanelProps) {
  const [priceRange, setPriceRange] = useState<[number, number]>([
    filters.minPrice || 0,
    filters.maxPrice || 500,
  ]);

  const updateFilter = <K extends keyof FilterState>(
    key: K,
    value: FilterState[K]
  ) => {
    onFiltersChange({ ...filters, [key]: value });
  };

  const toggleArrayFilter = <K extends keyof FilterState>(
    key: K,
    value: string
  ) => {
    const current = (filters[key] as string[]) || [];
    const updated = current.includes(value)
      ? current.filter((v) => v !== value)
      : [...current, value];
    updateFilter(key, updated as FilterState[K]);
  };

  const clearFilters = () => {
    onFiltersChange({
      search: "",
      pasteurizationType: [],
      physicalChannels: [],
      onlineChannels: [],
      minPrice: undefined,
      maxPrice: undefined,
      isOrganic: undefined,
      isImported: undefined,
    });
    setPriceRange([0, 500]);
  };

  const hasActiveFilters =
    filters.search ||
    filters.pasteurizationType.length > 0 ||
    filters.physicalChannels.length > 0 ||
    filters.onlineChannels.length > 0 ||
    filters.minPrice !== undefined ||
    filters.maxPrice !== undefined ||
    filters.isOrganic !== undefined ||
    filters.isImported !== undefined;

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h3 className="label-caps">篩選條件</h3>
        {hasActiveFilters && (
          <Button
            variant="ghost"
            size="sm"
            onClick={clearFilters}
            className="h-auto p-0 text-xs text-muted-foreground hover:text-foreground"
          >
            <X className="w-3 h-3 mr-1" />
            清除全部
          </Button>
        )}
      </div>

      {/* Search */}
      <div className="space-y-2">
        <Label className="label-caps">搜尋</Label>
        <Input
          placeholder="品牌或產品名稱..."
          value={filters.search}
          onChange={(e) => updateFilter("search", e.target.value)}
          className="h-10"
        />
      </div>

      {/* Pasteurization Type */}
      <Collapsible defaultOpen>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b border-border">
          <span className="label-caps">殺菌方式</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          {(Object.keys(PASTEURIZATION_LABELS) as PasteurizationType[]).map(
            (type) => (
              <label
                key={type}
                className="flex items-center gap-3 cursor-pointer group"
              >
                <Checkbox
                  checked={filters.pasteurizationType.includes(type)}
                  onCheckedChange={() =>
                    toggleArrayFilter("pasteurizationType", type)
                  }
                />
                <span className="text-sm group-hover:text-foreground transition-colors">
                  <span className={`pasteurization-badge ${type.toLowerCase()} mr-2`}>
                    {type}
                  </span>
                  {PASTEURIZATION_LABELS[type]}
                </span>
              </label>
            )
          )}
        </CollapsibleContent>
      </Collapsible>

      {/* Physical Channels */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b border-border">
          <span className="label-caps">實體通路</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2 max-h-48 overflow-y-auto">
          {availablePhysicalChannels.map((channel) => (
            <label
              key={channel}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={filters.physicalChannels.includes(channel)}
                onCheckedChange={() =>
                  toggleArrayFilter("physicalChannels", channel)
                }
              />
              <span className="text-sm group-hover:text-foreground transition-colors">
                {channel}
              </span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Online Channels */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b border-border">
          <span className="label-caps">線上通路</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2 max-h-48 overflow-y-auto">
          {availableOnlineChannels.map((channel) => (
            <label
              key={channel}
              className="flex items-center gap-3 cursor-pointer group"
            >
              <Checkbox
                checked={filters.onlineChannels.includes(channel)}
                onCheckedChange={() =>
                  toggleArrayFilter("onlineChannels", channel)
                }
              />
              <span className="text-sm group-hover:text-foreground transition-colors">
                {channel}
              </span>
            </label>
          ))}
        </CollapsibleContent>
      </Collapsible>

      {/* Price Range */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b border-border">
          <span className="label-caps">價格範圍</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-4 space-y-4">
          <Slider
            value={priceRange}
            onValueChange={(value) => setPriceRange(value as [number, number])}
            onValueCommit={(value) => {
              updateFilter("minPrice", value[0]);
              updateFilter("maxPrice", value[1]);
            }}
            min={0}
            max={500}
            step={10}
            className="w-full"
          />
          <div className="flex items-center justify-between text-sm text-muted-foreground">
            <span>NT${priceRange[0]}</span>
            <span>NT${priceRange[1]}</span>
          </div>
        </CollapsibleContent>
      </Collapsible>

      {/* Special Filters */}
      <Collapsible>
        <CollapsibleTrigger className="flex items-center justify-between w-full py-2 border-b border-border">
          <span className="label-caps">特殊條件</span>
          <ChevronDown className="w-4 h-4 text-muted-foreground transition-transform duration-200 [[data-state=open]>&]:rotate-180" />
        </CollapsibleTrigger>
        <CollapsibleContent className="pt-3 space-y-2">
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox
              checked={filters.isOrganic === true}
              onCheckedChange={(checked) =>
                updateFilter("isOrganic", checked ? true : undefined)
              }
            />
            <span className="text-sm group-hover:text-foreground transition-colors">
              有機認證
            </span>
          </label>
          <label className="flex items-center gap-3 cursor-pointer group">
            <Checkbox
              checked={filters.isImported === true}
              onCheckedChange={(checked) =>
                updateFilter("isImported", checked ? true : undefined)
              }
            />
            <span className="text-sm group-hover:text-foreground transition-colors">
              進口品牌
            </span>
          </label>
        </CollapsibleContent>
      </Collapsible>
    </div>
  );
}
