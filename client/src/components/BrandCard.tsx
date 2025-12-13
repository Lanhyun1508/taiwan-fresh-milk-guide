import { MilkBrand } from "@shared/types";
import { PASTEURIZATION_SHORT_LABELS, formatVolume, formatPrice } from "@shared/milkConstants";
import { Card, CardContent } from "@/components/ui/card";
import { Checkbox } from "@/components/ui/checkbox";
import { Link } from "wouter";
import { Milk, MapPin } from "lucide-react";

interface BrandCardProps {
  brand: MilkBrand;
  isSelected?: boolean;
  onSelect?: (id: number, selected: boolean) => void;
  showCheckbox?: boolean;
}

export function BrandCard({ brand, isSelected, onSelect, showCheckbox }: BrandCardProps) {
  const pasteurizationType = brand.pasteurizationType as keyof typeof PASTEURIZATION_SHORT_LABELS;
  
  return (
    <Card className="group relative overflow-hidden border-0 bg-card shadow-none hover:shadow-sm transition-shadow duration-300">
      <div className="absolute top-0 left-0 right-0 h-px bg-border" />
      
      {showCheckbox && (
        <div className="absolute top-4 right-4 z-10">
          <Checkbox
            checked={isSelected}
            onCheckedChange={(checked) => onSelect?.(brand.id, checked as boolean)}
            className="h-5 w-5 border-2"
          />
        </div>
      )}
      
      <Link href={`/brand/${brand.id}`}>
        <CardContent className="p-6">
          {/* Image Section */}
          <div className="aspect-[4/3] mb-6 bg-muted/30 overflow-hidden flex items-center justify-center">
            {brand.imageUrl ? (
              <img
                src={brand.imageUrl}
                alt={`${brand.brandName} ${brand.productName}`}
                className="w-full h-full object-contain"
              />
            ) : (
              <Milk className="w-16 h-16 text-muted-foreground/30" />
            )}
          </div>
          
          {/* Content Section */}
          <div className="space-y-3">
            {/* Pasteurization Badge */}
            <span className={`pasteurization-badge ${pasteurizationType.toLowerCase()}`}>
              {PASTEURIZATION_SHORT_LABELS[pasteurizationType]}
            </span>
            
            {/* Brand & Product Name */}
            <div>
              <p className="label-caps mb-1">{brand.brandName}</p>
              <h3 className="text-lg font-medium leading-tight group-hover:underline underline-offset-4">
                {brand.productName}
              </h3>
            </div>
            
            {/* Details */}
            <div className="flex items-baseline justify-between pt-2 border-t border-border/50">
              <span className="text-sm text-muted-foreground">
                {formatVolume(brand.volume)}
              </span>
              <span className="font-medium">
                {formatPrice(brand.price)}
              </span>
            </div>
            
            {/* Channels Preview */}
            {(brand.physicalChannels?.length || 0) > 0 && (
              <div className="flex items-center gap-1.5 text-xs text-muted-foreground">
                <MapPin className="w-3 h-3" />
                <span className="truncate">
                  {brand.physicalChannels?.slice(0, 3).join("、")}
                  {(brand.physicalChannels?.length || 0) > 3 && "..."}
                </span>
              </div>
            )}
          </div>
        </CardContent>
      </Link>
    </Card>
  );
}
