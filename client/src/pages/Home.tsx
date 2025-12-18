import { Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { Button } from "@/components/ui/button";
import { BrandCard } from "@/components/BrandCard";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { AnnouncementBanner } from "@/components/AnnouncementBanner";
import {
  PASTEURIZATION_LABELS,
  PASTEURIZATION_DESCRIPTIONS,
  type PasteurizationType,
} from "@shared/milkConstants";
import { ArrowRight, Search, Scale, Send, Milk } from "lucide-react";
import { useEffect } from "react";

export default function Home() {
  const { data: brands, isLoading } = trpc.brands.list.useQuery({});
  const { data: stats } = trpc.stats.get.useQuery();

  useEffect(() => {
    document.title = "台灣鮮乳選購指南 | 純鮮奶品牌資料庫 - 殺菌方式、通路、價格比較";
  }, []);

  const featuredBrands = brands?.slice(0, 4) || [];

  return (
    <div className="min-h-screen flex flex-col">
      <Header />
      <AnnouncementBanner />

      <main className="flex-1">
        {/* Hero Section */}
        <section className="py-16 md:py-24">
          <div className="container">
            <div className="max-w-3xl mx-auto text-center space-y-6">
              <p className="label-caps">Taiwan Fresh Milk Guide</p>
              <h1 className="text-4xl md:text-5xl lg:text-6xl font-normal tracking-tight">
                台灣鮮乳
                <br />
                <span className="italic">選購指南</span>
              </h1>
              <p className="text-lg text-muted-foreground max-w-xl mx-auto">
                完整收錄台灣市售鮮乳品牌，依殺菌方式分類，
                提供容量、價格、通路等詳細資訊，協助您選購最適合的鮮乳。
              </p>
              <div className="flex flex-col sm:flex-row items-center justify-center gap-4 pt-4">
                <Button size="lg" asChild>
                  <Link href="/brands">
                    瀏覽品牌列表
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Link>
                </Button>
                <Button variant="outline" size="lg" asChild>
                  <Link href="/submit">投稿新品牌</Link>
                </Button>
              </div>
            </div>
          </div>
        </section>

        <div className="editorial-line" />

        {/* Stats Section */}
        <section className="py-12">
          <div className="container">
            <div className="grid grid-cols-3 gap-8 max-w-2xl mx-auto text-center">
              <div>
                <p className="text-3xl md:text-4xl font-light">{stats?.totalBrands || 0}</p>
                <p className="label-caps mt-2">收錄品牌</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-light">4</p>
                <p className="label-caps mt-2">殺菌方式</p>
              </div>
              <div>
                <p className="text-3xl md:text-4xl font-light">{stats?.totalUsers || 0}</p>
                <p className="label-caps mt-2">參與用戶</p>
              </div>
            </div>
          </div>
        </section>

        <div className="editorial-line" />

        {/* Features Section */}
        <section className="py-16">
          <div className="container">
            <div className="text-center mb-12">
              <p className="label-caps mb-4">Features</p>
              <h2 className="text-2xl md:text-3xl">功能特色</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-8 max-w-4xl mx-auto">
              <div className="text-center space-y-4 p-6">
                <div className="w-12 h-12 mx-auto border border-border rounded-full flex items-center justify-center">
                  <Search className="w-5 h-5" />
                </div>
                <h3 className="text-lg">搜尋與篩選</h3>
                <p className="text-sm text-muted-foreground">
                  依殺菌方式、通路、價格等條件快速找到符合需求的鮮乳
                </p>
              </div>
              <div className="text-center space-y-4 p-6">
                <div className="w-12 h-12 mx-auto border border-border rounded-full flex items-center justify-center">
                  <Scale className="w-5 h-5" />
                </div>
                <h3 className="text-lg">品牌比較</h3>
                <p className="text-sm text-muted-foreground">
                  選擇多個品牌並排比較，一目了然各項規格差異
                </p>
              </div>
              <div className="text-center space-y-4 p-6">
                <div className="w-12 h-12 mx-auto border border-border rounded-full flex items-center justify-center">
                  <Send className="w-5 h-5" />
                </div>
                <h3 className="text-lg">協作投稿</h3>
                <p className="text-sm text-muted-foreground">
                  發現新品牌或資訊有誤？歡迎投稿，共同維護資料庫
                </p>
              </div>
            </div>
          </div>
        </section>

        <div className="editorial-line" />

        {/* Pasteurization Types Section */}
        <section className="py-16 bg-muted/30">
          <div className="container">
            <div className="text-center mb-12">
              <p className="label-caps mb-4">Pasteurization</p>
              <h2 className="text-2xl md:text-3xl">殺菌方式說明</h2>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {(Object.keys(PASTEURIZATION_LABELS) as PasteurizationType[]).map(
                (type) => (
                  <div
                    key={type}
                    className="bg-card p-6 space-y-3"
                  >
                    <span className={`pasteurization-badge ${type.toLowerCase()}`}>
                      {type}
                    </span>
                    <h3 className="font-medium">{PASTEURIZATION_LABELS[type]}</h3>
                    <p className="text-sm text-muted-foreground">
                      {PASTEURIZATION_DESCRIPTIONS[type]}
                    </p>
                  </div>
                )
              )}
            </div>
          </div>
        </section>

        {/* Featured Brands Section */}
        {featuredBrands.length > 0 && (
          <>
            <div className="editorial-line" />
            <section className="py-16">
              <div className="container">
                <div className="flex items-end justify-between mb-8">
                  <div>
                    <p className="label-caps mb-2">Featured</p>
                    <h2 className="text-2xl md:text-3xl">精選品牌</h2>
                  </div>
                  <Link
                    href="/brands"
                    className="text-sm text-muted-foreground hover:text-foreground flex items-center gap-1"
                  >
                    查看全部
                    <ArrowRight className="w-4 h-4" />
                  </Link>
                </div>
                <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-6">
                  {featuredBrands.map((brand) => (
                    <BrandCard key={brand.id} brand={brand} />
                  ))}
                </div>
              </div>
            </section>
          </>
        )}

        {/* CTA Section */}
        <section className="py-16 bg-primary text-primary-foreground">
          <div className="container">
            <div className="max-w-2xl mx-auto text-center space-y-6">
              <h2 className="text-2xl md:text-3xl">發現新品牌？</h2>
              <p className="text-primary-foreground/80">
                歡迎投稿新品牌資訊或更新現有資料，
                經審核後將更新至網站，共同維護最完整的鮮乳資料庫。
              </p>
              <Button
                variant="secondary"
                size="lg"
                asChild
              >
                <Link href="/submit">
                  <Send className="w-4 h-4 mr-2" />
                  立即投稿
                </Link>
              </Button>
            </div>
          </div>
        </section>
      </main>

      <Footer />
    </div>
  );
}
