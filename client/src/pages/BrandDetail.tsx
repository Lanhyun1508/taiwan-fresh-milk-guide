import { useParams, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Skeleton } from "@/components/ui/skeleton";
import {
  PASTEURIZATION_LABELS,
  PASTEURIZATION_DESCRIPTIONS,
  formatVolume,
  formatPrice,
  formatShelfLife,
  type PasteurizationType,
} from "@shared/milkConstants";
import {
  ArrowLeft,
  Milk,
  ExternalLink,
  MapPin,
  Globe,
  Calendar,
  Package,
  Leaf,
  Plane,
  Camera,
} from "lucide-react";

export default function BrandDetail() {
  const params = useParams<{ id: string }>();
  const brandId = parseInt(params.id || "0", 10);

  const { data: brand, isLoading, error } = trpc.brands.getById.useQuery(
    { id: brandId },
    { enabled: brandId > 0 }
  );

  if (isLoading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container max-w-4xl">
            <Skeleton className="h-8 w-32 mb-8" />
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              <Skeleton className="aspect-square" />
              <div className="space-y-4">
                <Skeleton className="h-6 w-24" />
                <Skeleton className="h-10 w-3/4" />
                <Skeleton className="h-6 w-1/2" />
                <Skeleton className="h-24 w-full" />
              </div>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  if (error || !brand) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-16">
          <div className="container text-center">
            <Milk className="w-16 h-16 mx-auto text-muted-foreground/30 mb-4" />
            <h1 className="text-2xl mb-2">找不到該品牌</h1>
            <p className="text-muted-foreground mb-6">
              該品牌可能已被移除或不存在
            </p>
            <Button asChild>
              <Link href="/brands">返回品牌列表</Link>
            </Button>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  const pasteurizationType = brand.pasteurizationType as PasteurizationType;

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container max-w-4xl">
          {/* Back Button */}
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            返回品牌列表
          </Link>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-8 lg:gap-12">
            {/* Image Section */}
            <div className="space-y-4">
              <div className="aspect-square bg-muted/30 flex items-center justify-center">
                {brand.imageUrl ? (
                  <img
                    src={brand.imageUrl}
                    alt={`${brand.brandName} ${brand.productName}`}
                    className="w-full h-full object-contain"
                  />
                ) : (
                  <div className="text-center">
                    <Milk className="w-24 h-24 mx-auto text-muted-foreground/30 mb-4" />
                    <p className="text-sm text-muted-foreground">尚無產品圖片</p>
                  </div>
                )}
              </div>
              <Button variant="outline" className="w-full" asChild>
                <Link href={`/submit?type=image&brandId=${brand.id}`}>
                  <Camera className="w-4 h-4 mr-2" />
                  上傳產品圖片
                </Link>
              </Button>
            </div>

            {/* Info Section */}
            <div className="space-y-6">
              {/* Header */}
              <div>
                <p className="label-caps mb-2">{brand.brandName}</p>
                <h1 className="text-3xl md:text-4xl mb-4">{brand.productName}</h1>
                <span className={`pasteurization-badge ${pasteurizationType.toLowerCase()}`}>
                  {pasteurizationType}
                </span>
              </div>

              {/* Price & Volume */}
              <div className="flex items-baseline gap-4 py-4 border-y border-border">
                <span className="text-3xl font-medium">
                  {formatPrice(brand.price)}
                </span>
                <span className="text-muted-foreground">
                  / {formatVolume(brand.volume)}
                </span>
                {brand.price && (
                  <span className="text-sm text-muted-foreground">
                    (NT${(brand.price / brand.volume * 100).toFixed(1)}/100ml)
                  </span>
                )}
              </div>

              {/* Pasteurization Info */}
              <div className="p-4 bg-muted/30 space-y-2">
                <h3 className="font-medium">{PASTEURIZATION_LABELS[pasteurizationType]}</h3>
                <p className="text-sm text-muted-foreground">
                  {PASTEURIZATION_DESCRIPTIONS[pasteurizationType]}
                </p>
              </div>

              {/* Details Grid */}
              <div className="grid grid-cols-2 gap-4">
                <DetailItem
                  icon={<Calendar className="w-4 h-4" />}
                  label="保存期限"
                  value={formatShelfLife(brand.shelfLife)}
                />
                <DetailItem
                  icon={<MapPin className="w-4 h-4" />}
                  label="產地"
                  value={brand.origin || "未標示"}
                />
                <DetailItem
                  icon={<Leaf className="w-4 h-4" />}
                  label="有機認證"
                  value={brand.isOrganic ? "是" : "否"}
                />
                <DetailItem
                  icon={<Plane className="w-4 h-4" />}
                  label="進口品牌"
                  value={brand.isImported ? "是" : "否"}
                />
              </div>

              {/* Official Website */}
              {brand.officialWebsite && (
                <a
                  href={brand.officialWebsite}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center gap-2 text-primary hover:underline"
                >
                  <Globe className="w-4 h-4" />
                  品牌官網
                  <ExternalLink className="w-3 h-3" />
                </a>
              )}

              {/* Ingredients */}
              {brand.ingredients && (
                <div className="space-y-2">
                  <h3 className="label-caps">成分</h3>
                  <p className="text-sm text-muted-foreground">
                    {brand.ingredients}
                  </p>
                </div>
              )}

              {/* Notes */}
              {brand.notes && (
                <div className="space-y-2">
                  <h3 className="label-caps">備註</h3>
                  <p className="text-sm text-muted-foreground">{brand.notes}</p>
                </div>
              )}
            </div>
          </div>

          {/* Channels Section */}
          <div className="mt-12 pt-8 border-t border-border">
            <h2 className="text-xl mb-6">販售通路</h2>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
              {/* Physical Channels */}
              <div className="space-y-4">
                <h3 className="label-caps flex items-center gap-2">
                  <MapPin className="w-4 h-4" />
                  實體通路
                </h3>
                {brand.physicalChannels?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {brand.physicalChannels.map((channel) => (
                      <span
                        key={channel}
                        className="px-3 py-1.5 bg-muted text-sm"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">尚無資料</p>
                )}
              </div>

              {/* Online Channels */}
              <div className="space-y-4">
                <h3 className="label-caps flex items-center gap-2">
                  <Globe className="w-4 h-4" />
                  線上通路
                </h3>
                {brand.onlineChannels?.length ? (
                  <div className="flex flex-wrap gap-2">
                    {brand.onlineChannels.map((channel) => (
                      <span
                        key={channel}
                        className="px-3 py-1.5 bg-muted text-sm"
                      >
                        {channel}
                      </span>
                    ))}
                  </div>
                ) : (
                  <p className="text-sm text-muted-foreground">尚無資料</p>
                )}
              </div>
            </div>
          </div>

          {/* Update Info CTA */}
          <div className="mt-12 p-6 bg-muted/30 text-center">
            <h3 className="text-lg mb-2">資訊有誤或需要更新？</h3>
            <p className="text-sm text-muted-foreground mb-4">
              歡迎投稿更新資訊，經審核後將更新至網站
            </p>
            <Button variant="outline" asChild>
              <Link href={`/submit?type=update&brandId=${brand.id}`}>
                提交更新
              </Link>
            </Button>
          </div>
        </div>
      </main>

      <Footer />
    </div>
  );
}

function DetailItem({
  icon,
  label,
  value,
}: {
  icon: React.ReactNode;
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-start gap-3">
      <span className="text-muted-foreground mt-0.5">{icon}</span>
      <div>
        <p className="text-xs text-muted-foreground">{label}</p>
        <p className="text-sm">{value}</p>
      </div>
    </div>
  );
}
