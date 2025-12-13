import { MilkBrand } from "@shared/types";
import {
  PASTEURIZATION_LABELS,
  formatVolume,
  formatPrice,
  formatShelfLife,
  type PasteurizationType,
} from "@shared/milkConstants";
import { Button } from "@/components/ui/button";
import {
  Sheet,
  SheetContent,
  SheetHeader,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { ScrollArea } from "@/components/ui/scroll-area";
import { X, Scale, Milk, ExternalLink } from "lucide-react";

interface ComparePanelProps {
  selectedBrands: MilkBrand[];
  onRemove: (id: number) => void;
  onClear: () => void;
}

export function ComparePanel({
  selectedBrands,
  onRemove,
  onClear,
}: ComparePanelProps) {
  if (selectedBrands.length === 0) return null;

  return (
    <div className="fixed bottom-0 left-0 right-0 z-50 bg-card border-t border-border shadow-lg">
      <div className="container py-4">
        <div className="flex items-center justify-between gap-4">
          {/* Selected brands preview */}
          <div className="flex items-center gap-3 overflow-x-auto">
            <span className="label-caps shrink-0">
              已選擇 {selectedBrands.length} 項
            </span>
            <div className="flex gap-2">
              {selectedBrands.map((brand) => (
                <div
                  key={brand.id}
                  className="flex items-center gap-2 px-3 py-1.5 bg-muted rounded text-sm"
                >
                  <span className="truncate max-w-32">
                    {brand.brandName} {brand.productName}
                  </span>
                  <button
                    onClick={() => onRemove(brand.id)}
                    className="text-muted-foreground hover:text-foreground"
                  >
                    <X className="w-3 h-3" />
                  </button>
                </div>
              ))}
            </div>
          </div>

          {/* Actions */}
          <div className="flex items-center gap-2 shrink-0">
            <Button variant="ghost" size="sm" onClick={onClear}>
              清除
            </Button>
            <Sheet>
              <SheetTrigger asChild>
                <Button size="sm" disabled={selectedBrands.length < 2}>
                  <Scale className="w-4 h-4 mr-2" />
                  比較
                </Button>
              </SheetTrigger>
              <SheetContent
                side="bottom"
                className="h-[80vh] max-h-[800px]"
              >
                <SheetHeader className="pb-4 border-b">
                  <SheetTitle className="text-2xl">品牌比較</SheetTitle>
                </SheetHeader>
                <ScrollArea className="h-full py-6">
                  <CompareTable brands={selectedBrands} />
                </ScrollArea>
              </SheetContent>
            </Sheet>
          </div>
        </div>
      </div>
    </div>
  );
}

interface CompareTableProps {
  brands: MilkBrand[];
}

function CompareTable({ brands }: CompareTableProps) {
  const rows: {
    label: string;
    getValue: (brand: MilkBrand) => React.ReactNode;
  }[] = [
    {
      label: "產品圖片",
      getValue: (brand) =>
        brand.imageUrl ? (
          <img
            src={brand.imageUrl}
            alt={brand.productName}
            className="w-24 h-24 object-contain mx-auto"
          />
        ) : (
          <div className="w-24 h-24 bg-muted/30 flex items-center justify-center mx-auto">
            <Milk className="w-8 h-8 text-muted-foreground/30" />
          </div>
        ),
    },
    {
      label: "品牌",
      getValue: (brand) => brand.brandName,
    },
    {
      label: "產品名稱",
      getValue: (brand) => (
        <span className="font-medium">{brand.productName}</span>
      ),
    },
    {
      label: "殺菌方式",
      getValue: (brand) => (
        <div className="space-y-1">
          <span
            className={`pasteurization-badge ${brand.pasteurizationType.toLowerCase()}`}
          >
            {brand.pasteurizationType}
          </span>
          <p className="text-xs text-muted-foreground">
            {PASTEURIZATION_LABELS[brand.pasteurizationType as PasteurizationType]}
          </p>
        </div>
      ),
    },
    {
      label: "容量",
      getValue: (brand) => formatVolume(brand.volume),
    },
    {
      label: "價格",
      getValue: (brand) => (
        <span className="font-medium">{formatPrice(brand.price)}</span>
      ),
    },
    {
      label: "每毫升價格",
      getValue: (brand) => {
        if (!brand.price) return "—";
        const pricePerMl = brand.price / brand.volume;
        return `NT$${pricePerMl.toFixed(3)}/ml`;
      },
    },
    {
      label: "保存期限",
      getValue: (brand) => formatShelfLife(brand.shelfLife),
    },
    {
      label: "產地",
      getValue: (brand) => brand.origin || "—",
    },
    {
      label: "有機認證",
      getValue: (brand) => (brand.isOrganic ? "是" : "否"),
    },
    {
      label: "進口品牌",
      getValue: (brand) => (brand.isImported ? "是" : "否"),
    },
    {
      label: "實體通路",
      getValue: (brand) =>
        brand.physicalChannels?.length ? (
          <div className="flex flex-wrap gap-1">
            {brand.physicalChannels.map((c) => (
              <span
                key={c}
                className="px-2 py-0.5 bg-muted text-xs rounded"
              >
                {c}
              </span>
            ))}
          </div>
        ) : (
          "—"
        ),
    },
    {
      label: "線上通路",
      getValue: (brand) =>
        brand.onlineChannels?.length ? (
          <div className="flex flex-wrap gap-1">
            {brand.onlineChannels.map((c) => (
              <span
                key={c}
                className="px-2 py-0.5 bg-muted text-xs rounded"
              >
                {c}
              </span>
            ))}
          </div>
        ) : (
          "—"
        ),
    },
    {
      label: "官方網站",
      getValue: (brand) =>
        brand.officialWebsite ? (
          <a
            href={brand.officialWebsite}
            target="_blank"
            rel="noopener noreferrer"
            className="inline-flex items-center gap-1 text-primary hover:underline"
          >
            前往
            <ExternalLink className="w-3 h-3" />
          </a>
        ) : (
          "—"
        ),
    },
  ];

  return (
    <div className="overflow-x-auto">
      <table className="w-full min-w-[600px]">
        <thead>
          <tr>
            <th className="text-left p-3 bg-muted/50 label-caps w-32">項目</th>
            {brands.map((brand) => (
              <th
                key={brand.id}
                className="text-center p-3 bg-muted/50 min-w-[200px]"
              >
                <span className="label-caps">{brand.brandName}</span>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {rows.map((row, index) => (
            <tr
              key={row.label}
              className={index % 2 === 0 ? "bg-background" : "bg-muted/20"}
            >
              <td className="p-3 text-sm text-muted-foreground border-r border-border">
                {row.label}
              </td>
              {brands.map((brand) => (
                <td
                  key={brand.id}
                  className="p-3 text-center text-sm border-r border-border last:border-r-0"
                >
                  {row.getValue(brand)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
