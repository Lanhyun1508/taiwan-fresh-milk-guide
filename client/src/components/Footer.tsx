import { Link } from "wouter";

export function Footer() {
  const currentYear = new Date().getFullYear();

  return (
    <footer className="mt-auto border-t border-border">
      <div className="container py-12">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {/* About */}
          <div className="space-y-4">
            <h4 className="label-caps">關於本站</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              台灣鮮乳選購指南致力於提供最完整的鮮乳品牌資訊，
              協助消費者了解各品牌的殺菌方式、通路與價格，
              做出最適合自己的選擇。
            </p>
          </div>

          {/* Quick Links */}
          <div className="space-y-4">
            <h4 className="label-caps">快速連結</h4>
            <nav className="flex flex-col gap-2">
              <Link
                href="/brands"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                品牌列表
              </Link>
              <Link
                href="/submit"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                投稿新品牌
              </Link>
              <Link
                href="/about"
                className="text-sm text-muted-foreground hover:text-foreground transition-colors"
              >
                殺菌方式說明
              </Link>
            </nav>
          </div>

          {/* Contact */}
          <div className="space-y-4">
            <h4 className="label-caps">參與貢獻</h4>
            <p className="text-sm text-muted-foreground leading-relaxed">
              發現新品牌或資訊有誤？歡迎透過投稿功能提交更新，
              經審核後將更新至網站。
            </p>
          </div>
        </div>

        <div className="editorial-line my-8" />

        <div className="flex flex-col sm:flex-row items-center justify-between gap-4 text-xs text-muted-foreground">
          <p>© {currentYear} 台灣鮮乳選購指南</p>
          <p>資料僅供參考，實際資訊以各品牌官方公告為準</p>
        </div>
      </div>
    </footer>
  );
}
