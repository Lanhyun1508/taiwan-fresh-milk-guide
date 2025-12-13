import { useState, useEffect } from "react";
import { useLocation, useSearch, Link } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import { toast } from "sonner";
import {
  PASTEURIZATION_LABELS,
  PHYSICAL_CHANNELS,
  ONLINE_CHANNELS,
  COMMON_VOLUMES,
  type PasteurizationType,
} from "@shared/milkConstants";
import { Send, CheckCircle, ArrowLeft } from "lucide-react";

type SubmissionType = "brand" | "update" | "image";

export default function Submit() {
  const searchString = useSearch();
  const params = new URLSearchParams(searchString);
  const typeParam = params.get("type") as SubmissionType | null;
  const brandIdParam = params.get("brandId");

  const [, navigate] = useLocation();
  const { user, isAuthenticated } = useAuth();
  const [submitted, setSubmitted] = useState(false);
  const [submissionType, setSubmissionType] = useState<SubmissionType>(
    typeParam || "brand"
  );

  // Form state
  const [formData, setFormData] = useState({
    brandName: "",
    productName: "",
    pasteurizationType: "" as PasteurizationType | "",
    volume: "",
    shelfLife: "",
    price: "",
    origin: "",
    ingredients: "",
    officialWebsite: "",
    physicalChannels: [] as string[],
    onlineChannels: [] as string[],
    notes: "",
    isOrganic: false,
    isImported: false,
    updateDescription: "",
    submitterName: "",
    submitterEmail: "",
  });

  const relatedBrandId = brandIdParam ? parseInt(brandIdParam, 10) : undefined;
  const { data: relatedBrand } = trpc.brands.getById.useQuery(
    { id: relatedBrandId! },
    { enabled: !!relatedBrandId }
  );

  // Pre-fill form with related brand data for updates
  useEffect(() => {
    if (relatedBrand && submissionType === "update") {
      setFormData((prev) => ({
        ...prev,
        brandName: relatedBrand.brandName,
        productName: relatedBrand.productName,
        pasteurizationType: relatedBrand.pasteurizationType as PasteurizationType,
        volume: relatedBrand.volume.toString(),
        shelfLife: relatedBrand.shelfLife?.toString() || "",
        price: relatedBrand.price?.toString() || "",
        origin: relatedBrand.origin || "",
        ingredients: relatedBrand.ingredients || "",
        officialWebsite: relatedBrand.officialWebsite || "",
        physicalChannels: relatedBrand.physicalChannels || [],
        onlineChannels: relatedBrand.onlineChannels || [],
        notes: relatedBrand.notes || "",
        isOrganic: relatedBrand.isOrganic || false,
        isImported: relatedBrand.isImported || false,
      }));
    }
  }, [relatedBrand, submissionType]);

  const createSubmission = trpc.submissions.create.useMutation({
    onSuccess: () => {
      setSubmitted(true);
      toast.success("投稿已送出，感謝您的貢獻！");
    },
    onError: (error) => {
      toast.error(`投稿失敗：${error.message}`);
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    // Validation
    if (submissionType === "brand") {
      if (!formData.brandName || !formData.productName || !formData.pasteurizationType || !formData.volume) {
        toast.error("請填寫必要欄位：品牌名稱、產品名稱、殺菌方式、容量");
        return;
      }
    }

    createSubmission.mutate({
      submissionType,
      relatedBrandId,
      content: {
        brandName: formData.brandName || undefined,
        productName: formData.productName || undefined,
        pasteurizationType: formData.pasteurizationType || undefined,
        volume: formData.volume ? parseInt(formData.volume, 10) : undefined,
        shelfLife: formData.shelfLife ? parseInt(formData.shelfLife, 10) : undefined,
        price: formData.price ? parseInt(formData.price, 10) : undefined,
        origin: formData.origin || undefined,
        ingredients: formData.ingredients || undefined,
        officialWebsite: formData.officialWebsite || undefined,
        physicalChannels: formData.physicalChannels.length > 0 ? formData.physicalChannels : undefined,
        onlineChannels: formData.onlineChannels.length > 0 ? formData.onlineChannels : undefined,
        notes: formData.notes || undefined,
        isOrganic: formData.isOrganic,
        isImported: formData.isImported,
        updateDescription: formData.updateDescription || undefined,
      },
      submitterName: formData.submitterName || undefined,
      submitterEmail: formData.submitterEmail || undefined,
    });
  };

  const toggleChannel = (type: "physicalChannels" | "onlineChannels", channel: string) => {
    setFormData((prev) => ({
      ...prev,
      [type]: prev[type].includes(channel)
        ? prev[type].filter((c) => c !== channel)
        : [...prev[type], channel],
    }));
  };

  if (submitted) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-16">
          <div className="container max-w-lg text-center">
            <CheckCircle className="w-16 h-16 mx-auto text-green-600 mb-6" />
            <h1 className="text-2xl mb-4">投稿已送出</h1>
            <p className="text-muted-foreground mb-8">
              感謝您的貢獻！我們會盡快審核您的投稿，
              審核通過後將更新至網站。
            </p>
            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button asChild>
                <Link href="/brands">瀏覽品牌列表</Link>
              </Button>
              <Button variant="outline" onClick={() => setSubmitted(false)}>
                繼續投稿
              </Button>
            </div>
          </div>
        </main>
        <Footer />
      </div>
    );
  }

  return (
    <div className="min-h-screen flex flex-col">
      <Header />

      <main className="flex-1 py-8">
        <div className="container max-w-2xl">
          {/* Back Button */}
          <Link
            href="/brands"
            className="inline-flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground mb-8"
          >
            <ArrowLeft className="w-4 h-4" />
            返回品牌列表
          </Link>

          {/* Page Header */}
          <div className="mb-8">
            <p className="label-caps mb-2">Contribute</p>
            <h1 className="text-3xl md:text-4xl">投稿</h1>
            <p className="text-muted-foreground mt-2">
              發現新品牌或資訊有誤？歡迎投稿，經審核後將更新至網站。
            </p>
          </div>

          {/* Submission Type Selector */}
          <div className="mb-8">
            <Label className="label-caps mb-3 block">投稿類型</Label>
            <div className="flex gap-4">
              {[
                { value: "brand", label: "新增品牌" },
                { value: "update", label: "更新資訊" },
                { value: "image", label: "上傳圖片" },
              ].map((type) => (
                <button
                  key={type.value}
                  onClick={() => setSubmissionType(type.value as SubmissionType)}
                  className={`px-4 py-2 text-sm border transition-colors ${
                    submissionType === type.value
                      ? "border-primary bg-primary text-primary-foreground"
                      : "border-border hover:border-foreground"
                  }`}
                >
                  {type.label}
                </button>
              ))}
            </div>
          </div>

          {/* Related Brand Info */}
          {relatedBrand && (
            <div className="mb-8 p-4 bg-muted/30">
              <p className="text-sm text-muted-foreground mb-1">相關品牌</p>
              <p className="font-medium">
                {relatedBrand.brandName} - {relatedBrand.productName}
              </p>
            </div>
          )}

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-8">
            {/* Brand Info Section */}
            {(submissionType === "brand" || submissionType === "update") && (
              <>
                <section className="space-y-4">
                  <h2 className="text-lg border-b border-border pb-2">基本資訊</h2>
                  
                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="brandName">
                        品牌名稱 {submissionType === "brand" && <span className="text-destructive">*</span>}
                      </Label>
                      <Input
                        id="brandName"
                        value={formData.brandName}
                        onChange={(e) => setFormData({ ...formData, brandName: e.target.value })}
                        placeholder="例：鮮乳坊"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="productName">
                        產品名稱 {submissionType === "brand" && <span className="text-destructive">*</span>}
                      </Label>
                      <Input
                        id="productName"
                        value={formData.productName}
                        onChange={(e) => setFormData({ ...formData, productName: e.target.value })}
                        placeholder="例：鮮乳坊鮮乳"
                      />
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label>
                        殺菌方式 {submissionType === "brand" && <span className="text-destructive">*</span>}
                      </Label>
                      <Select
                        value={formData.pasteurizationType}
                        onValueChange={(value) =>
                          setFormData({ ...formData, pasteurizationType: value as PasteurizationType })
                        }
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選擇殺菌方式" />
                        </SelectTrigger>
                        <SelectContent>
                          {(Object.keys(PASTEURIZATION_LABELS) as PasteurizationType[]).map((type) => (
                            <SelectItem key={type} value={type}>
                              {type} - {PASTEURIZATION_LABELS[type]}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="volume">
                        容量 (ml) {submissionType === "brand" && <span className="text-destructive">*</span>}
                      </Label>
                      <Select
                        value={formData.volume}
                        onValueChange={(value) => setFormData({ ...formData, volume: value })}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="選擇或輸入容量" />
                        </SelectTrigger>
                        <SelectContent>
                          {COMMON_VOLUMES.map((vol) => (
                            <SelectItem key={vol} value={vol.toString()}>
                              {vol >= 1000 ? `${vol / 1000}L` : `${vol}ml`}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="price">價格 (NT$)</Label>
                      <Input
                        id="price"
                        type="number"
                        value={formData.price}
                        onChange={(e) => setFormData({ ...formData, price: e.target.value })}
                        placeholder="例：89"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="shelfLife">保存期限 (天)</Label>
                      <Input
                        id="shelfLife"
                        type="number"
                        value={formData.shelfLife}
                        onChange={(e) => setFormData({ ...formData, shelfLife: e.target.value })}
                        placeholder="例：14"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="origin">產地</Label>
                      <Input
                        id="origin"
                        value={formData.origin}
                        onChange={(e) => setFormData({ ...formData, origin: e.target.value })}
                        placeholder="例：台灣"
                      />
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="officialWebsite">品牌官網</Label>
                    <Input
                      id="officialWebsite"
                      type="url"
                      value={formData.officialWebsite}
                      onChange={(e) => setFormData({ ...formData, officialWebsite: e.target.value })}
                      placeholder="https://..."
                    />
                  </div>

                  <div className="flex gap-6">
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formData.isOrganic}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isOrganic: checked as boolean })
                        }
                      />
                      <span className="text-sm">有機認證</span>
                    </label>
                    <label className="flex items-center gap-2 cursor-pointer">
                      <Checkbox
                        checked={formData.isImported}
                        onCheckedChange={(checked) =>
                          setFormData({ ...formData, isImported: checked as boolean })
                        }
                      />
                      <span className="text-sm">進口品牌</span>
                    </label>
                  </div>
                </section>

                {/* Channels Section */}
                <section className="space-y-4">
                  <h2 className="text-lg border-b border-border pb-2">販售通路</h2>
                  
                  <div className="space-y-4">
                    <div>
                      <Label className="mb-3 block">實體通路</Label>
                      <div className="flex flex-wrap gap-2">
                        {PHYSICAL_CHANNELS.map((channel) => (
                          <label
                            key={channel}
                            className={`px-3 py-1.5 text-sm border cursor-pointer transition-colors ${
                              formData.physicalChannels.includes(channel)
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-foreground"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={formData.physicalChannels.includes(channel)}
                              onChange={() => toggleChannel("physicalChannels", channel)}
                            />
                            {channel}
                          </label>
                        ))}
                      </div>
                    </div>

                    <div>
                      <Label className="mb-3 block">線上通路</Label>
                      <div className="flex flex-wrap gap-2">
                        {ONLINE_CHANNELS.map((channel) => (
                          <label
                            key={channel}
                            className={`px-3 py-1.5 text-sm border cursor-pointer transition-colors ${
                              formData.onlineChannels.includes(channel)
                                ? "border-primary bg-primary/10"
                                : "border-border hover:border-foreground"
                            }`}
                          >
                            <input
                              type="checkbox"
                              className="sr-only"
                              checked={formData.onlineChannels.includes(channel)}
                              onChange={() => toggleChannel("onlineChannels", channel)}
                            />
                            {channel}
                          </label>
                        ))}
                      </div>
                    </div>
                  </div>
                </section>

                {/* Additional Info */}
                <section className="space-y-4">
                  <h2 className="text-lg border-b border-border pb-2">其他資訊</h2>
                  
                  <div className="space-y-2">
                    <Label htmlFor="ingredients">成分說明</Label>
                    <Textarea
                      id="ingredients"
                      value={formData.ingredients}
                      onChange={(e) => setFormData({ ...formData, ingredients: e.target.value })}
                      placeholder="例：生乳"
                      rows={2}
                    />
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="notes">備註</Label>
                    <Textarea
                      id="notes"
                      value={formData.notes}
                      onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                      placeholder="其他補充說明..."
                      rows={2}
                    />
                  </div>

                  {submissionType === "update" && (
                    <div className="space-y-2">
                      <Label htmlFor="updateDescription">更新說明</Label>
                      <Textarea
                        id="updateDescription"
                        value={formData.updateDescription}
                        onChange={(e) => setFormData({ ...formData, updateDescription: e.target.value })}
                        placeholder="請說明需要更新的內容..."
                        rows={3}
                      />
                    </div>
                  )}
                </section>
              </>
            )}

            {/* Image Upload Section */}
            {submissionType === "image" && (
              <section className="space-y-4">
                <h2 className="text-lg border-b border-border pb-2">圖片上傳</h2>
                <p className="text-sm text-muted-foreground">
                  圖片上傳功能開發中，請先透過「更新資訊」投稿並在備註中說明圖片來源。
                </p>
              </section>
            )}

            {/* Submitter Info */}
            {!isAuthenticated && (
              <section className="space-y-4">
                <h2 className="text-lg border-b border-border pb-2">投稿者資訊（選填）</h2>
                <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label htmlFor="submitterName">姓名</Label>
                    <Input
                      id="submitterName"
                      value={formData.submitterName}
                      onChange={(e) => setFormData({ ...formData, submitterName: e.target.value })}
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="submitterEmail">Email</Label>
                    <Input
                      id="submitterEmail"
                      type="email"
                      value={formData.submitterEmail}
                      onChange={(e) => setFormData({ ...formData, submitterEmail: e.target.value })}
                    />
                  </div>
                </div>
              </section>
            )}

            {/* Submit Button */}
            <div className="pt-4">
              <Button
                type="submit"
                size="lg"
                className="w-full sm:w-auto"
                disabled={createSubmission.isPending}
              >
                <Send className="w-4 h-4 mr-2" />
                {createSubmission.isPending ? "送出中..." : "送出投稿"}
              </Button>
            </div>
          </form>
        </div>
      </main>

      <Footer />
    </div>
  );
}
