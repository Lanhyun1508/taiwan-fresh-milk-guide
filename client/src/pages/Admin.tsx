import { useState } from "react";
import { useLocation } from "wouter";
import { trpc } from "@/lib/trpc";
import { useAuth } from "@/_core/hooks/useAuth";
import { Header } from "@/components/Header";
import { Footer } from "@/components/Footer";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import {
  Tabs,
  TabsContent,
  TabsList,
  TabsTrigger,
} from "@/components/ui/tabs";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Skeleton } from "@/components/ui/skeleton";
import { toast } from "sonner";
import { Submission, Announcement } from "@shared/types";
import {
  SUBMISSION_TYPE_LABELS,
  ANNOUNCEMENT_TYPE_LABELS,
  type SubmissionType,
  type AnnouncementType,
} from "@shared/milkConstants";
import {
  Check,
  X,
  Eye,
  RefreshCw,
  Plus,
  Trash2,
  Edit,
  AlertCircle,
  CheckCircle,
  Clock,
  Megaphone,
} from "lucide-react";

export default function Admin() {
  const { user, isAuthenticated, loading } = useAuth();
  const [, navigate] = useLocation();

  // Redirect non-admin users
  if (!loading && (!isAuthenticated || user?.role !== "admin")) {
    navigate("/");
    return null;
  }

  if (loading) {
    return (
      <div className="min-h-screen flex flex-col">
        <Header />
        <main className="flex-1 py-8">
          <div className="container">
            <Skeleton className="h-8 w-48 mb-8" />
            <Skeleton className="h-64 w-full" />
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
        <div className="container">
          {/* Page Header */}
          <div className="mb-8">
            <p className="label-caps mb-2">Administration</p>
            <h1 className="text-3xl md:text-4xl">管理後台</h1>
          </div>

          {/* Tabs */}
          <Tabs defaultValue="submissions">
            <TabsList className="mb-8">
              <TabsTrigger value="submissions">投稿審核</TabsTrigger>
              <TabsTrigger value="announcements">公告管理</TabsTrigger>
              <TabsTrigger value="stats">統計資訊</TabsTrigger>
            </TabsList>

            <TabsContent value="submissions">
              <SubmissionsPanel />
            </TabsContent>

            <TabsContent value="announcements">
              <AnnouncementsPanel />
            </TabsContent>

            <TabsContent value="stats">
              <StatsPanel />
            </TabsContent>
          </Tabs>
        </div>
      </main>

      <Footer />
    </div>
  );
}

// Submissions Panel
function SubmissionsPanel() {
  const [statusFilter, setStatusFilter] = useState<"pending" | "approved" | "rejected">("pending");
  const [selectedSubmission, setSelectedSubmission] = useState<Submission | null>(null);
  const [reviewNotes, setReviewNotes] = useState("");

  const { data: submissions, isLoading, refetch } = trpc.submissions.getByStatus.useQuery({
    status: statusFilter,
  });

  const approveMutation = trpc.submissions.approve.useMutation({
    onSuccess: () => {
      toast.success("投稿已批准");
      setSelectedSubmission(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`操作失敗：${error.message}`);
    },
  });

  const rejectMutation = trpc.submissions.reject.useMutation({
    onSuccess: () => {
      toast.success("投稿已拒絕");
      setSelectedSubmission(null);
      refetch();
    },
    onError: (error) => {
      toast.error(`操作失敗：${error.message}`);
    },
  });

  const revalidateMutation = trpc.submissions.revalidate.useMutation({
    onSuccess: (result) => {
      toast.success("LLM 驗證完成");
      refetch();
    },
    onError: (error) => {
      toast.error(`驗證失敗：${error.message}`);
    },
  });

  const handleApprove = (applyToBrand: boolean) => {
    if (!selectedSubmission) return;
    approveMutation.mutate({
      id: selectedSubmission.id,
      reviewNotes,
      applyToBrand,
    });
  };

  const handleReject = () => {
    if (!selectedSubmission || !reviewNotes) {
      toast.error("請填寫拒絕原因");
      return;
    }
    rejectMutation.mutate({
      id: selectedSubmission.id,
      reviewNotes,
    });
  };

  return (
    <div className="space-y-6">
      {/* Status Filter */}
      <div className="flex items-center gap-4">
        <Label className="label-caps">狀態篩選</Label>
        <div className="flex gap-2">
          {(["pending", "approved", "rejected"] as const).map((status) => (
            <Button
              key={status}
              variant={statusFilter === status ? "default" : "outline"}
              size="sm"
              onClick={() => setStatusFilter(status)}
            >
              {status === "pending" && <Clock className="w-4 h-4 mr-1" />}
              {status === "approved" && <CheckCircle className="w-4 h-4 mr-1" />}
              {status === "rejected" && <X className="w-4 h-4 mr-1" />}
              {status === "pending" ? "待審核" : status === "approved" ? "已批准" : "已拒絕"}
            </Button>
          ))}
        </div>
      </div>

      {/* Submissions List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-24 w-full" />
          ))}
        </div>
      ) : submissions?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          沒有{statusFilter === "pending" ? "待審核" : statusFilter === "approved" ? "已批准" : "已拒絕"}的投稿
        </div>
      ) : (
        <div className="space-y-4">
          {submissions?.map((submission) => (
            <div
              key={submission.id}
              className="p-4 border border-border bg-card hover:shadow-sm transition-shadow"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant="outline">
                      {SUBMISSION_TYPE_LABELS[submission.submissionType as SubmissionType]}
                    </Badge>
                    {submission.llmValidation && (
                      <Badge
                        variant={submission.llmValidation.isValid ? "default" : "destructive"}
                      >
                        LLM: {submission.llmValidation.confidence}%
                      </Badge>
                    )}
                  </div>
                  <p className="font-medium">
                    {String((submission.content as Record<string, unknown>).brandName || "未命名")} -{" "}
                    {String((submission.content as Record<string, unknown>).productName || "")}
                  </p>
                  <p className="text-sm text-muted-foreground mt-1">
                    投稿時間：{new Date(submission.createdAt).toLocaleString("zh-TW")}
                  </p>
                  {submission.submitterName && (
                    <p className="text-sm text-muted-foreground">
                      投稿者：{submission.submitterName}
                    </p>
                  )}
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => revalidateMutation.mutate({ id: submission.id })}
                    disabled={revalidateMutation.isPending}
                  >
                    <RefreshCw className={`w-4 h-4 ${revalidateMutation.isPending ? "animate-spin" : ""}`} />
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      setSelectedSubmission(submission);
                      setReviewNotes("");
                    }}
                  >
                    <Eye className="w-4 h-4 mr-1" />
                    查看
                  </Button>
                </div>
              </div>

              {/* LLM Validation Issues */}
              {submission.llmValidation?.issues && submission.llmValidation.issues.length > 0 && (
                <div className="mt-3 p-3 bg-destructive/10 text-sm">
                  <p className="font-medium text-destructive mb-1">LLM 發現問題：</p>
                  <ul className="list-disc list-inside text-muted-foreground">
                    {submission.llmValidation.issues.map((issue, i) => (
                      <li key={i}>{issue}</li>
                    ))}
                  </ul>
                </div>
              )}
            </div>
          ))}
        </div>
      )}

      {/* Review Dialog */}
      <Dialog open={!!selectedSubmission} onOpenChange={() => setSelectedSubmission(null)}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>審核投稿</DialogTitle>
          </DialogHeader>

          {selectedSubmission && (
            <div className="space-y-4">
              {/* Submission Content */}
              <div className="p-4 bg-muted/30 space-y-2">
                <h4 className="font-medium">投稿內容</h4>
                <pre className="text-sm whitespace-pre-wrap overflow-x-auto">
                  {JSON.stringify(selectedSubmission.content, null, 2)}
                </pre>
              </div>

              {/* LLM Validation */}
              {selectedSubmission.llmValidation && (
                <div className="p-4 bg-muted/30 space-y-2">
                  <h4 className="font-medium">LLM 驗證結果</h4>
                  <div className="flex items-center gap-2">
                    {selectedSubmission.llmValidation.isValid ? (
                      <CheckCircle className="w-4 h-4 text-green-600" />
                    ) : (
                      <AlertCircle className="w-4 h-4 text-destructive" />
                    )}
                    <span>
                      {selectedSubmission.llmValidation.isValid ? "驗證通過" : "驗證未通過"}
                      （信心度：{selectedSubmission.llmValidation.confidence}%）
                    </span>
                  </div>
                  {selectedSubmission.llmValidation.issues.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">問題：</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {selectedSubmission.llmValidation.issues.map((issue, i) => (
                          <li key={i}>{issue}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                  {selectedSubmission.llmValidation.suggestions.length > 0 && (
                    <div>
                      <p className="text-sm font-medium">建議：</p>
                      <ul className="list-disc list-inside text-sm text-muted-foreground">
                        {selectedSubmission.llmValidation.suggestions.map((suggestion, i) => (
                          <li key={i}>{suggestion}</li>
                        ))}
                      </ul>
                    </div>
                  )}
                </div>
              )}

              {/* Review Notes */}
              <div className="space-y-2">
                <Label htmlFor="reviewNotes">審核備註</Label>
                <Textarea
                  id="reviewNotes"
                  value={reviewNotes}
                  onChange={(e) => setReviewNotes(e.target.value)}
                  placeholder="填寫審核備註（拒絕時必填）..."
                  rows={3}
                />
              </div>
            </div>
          )}

          <DialogFooter className="flex-col sm:flex-row gap-2">
            <Button
              variant="destructive"
              onClick={handleReject}
              disabled={rejectMutation.isPending}
            >
              <X className="w-4 h-4 mr-1" />
              拒絕
            </Button>
            <Button
              variant="outline"
              onClick={() => handleApprove(false)}
              disabled={approveMutation.isPending}
            >
              <Check className="w-4 h-4 mr-1" />
              批准（不套用）
            </Button>
            <Button
              onClick={() => handleApprove(true)}
              disabled={approveMutation.isPending}
            >
              <Check className="w-4 h-4 mr-1" />
              批准並套用
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Announcements Panel
function AnnouncementsPanel() {
  const [showCreateDialog, setShowCreateDialog] = useState(false);
  const [editingAnnouncement, setEditingAnnouncement] = useState<Announcement | null>(null);
  const [formData, setFormData] = useState({
    title: "",
    content: "",
    type: "info" as AnnouncementType,
    isActive: true,
  });

  const { data: announcements, isLoading, refetch } = trpc.announcements.getAll.useQuery();

  const createMutation = trpc.announcements.create.useMutation({
    onSuccess: () => {
      toast.success("公告已建立");
      setShowCreateDialog(false);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`建立失敗：${error.message}`);
    },
  });

  const updateMutation = trpc.announcements.update.useMutation({
    onSuccess: () => {
      toast.success("公告已更新");
      setEditingAnnouncement(null);
      resetForm();
      refetch();
    },
    onError: (error) => {
      toast.error(`更新失敗：${error.message}`);
    },
  });

  const deleteMutation = trpc.announcements.delete.useMutation({
    onSuccess: () => {
      toast.success("公告已刪除");
      refetch();
    },
    onError: (error) => {
      toast.error(`刪除失敗：${error.message}`);
    },
  });

  const resetForm = () => {
    setFormData({
      title: "",
      content: "",
      type: "info",
      isActive: true,
    });
  };

  const handleCreate = () => {
    if (!formData.title || !formData.content) {
      toast.error("請填寫標題和內容");
      return;
    }
    createMutation.mutate(formData);
  };

  const handleUpdate = () => {
    if (!editingAnnouncement || !formData.title || !formData.content) {
      toast.error("請填寫標題和內容");
      return;
    }
    updateMutation.mutate({
      id: editingAnnouncement.id,
      data: formData,
    });
  };

  const openEditDialog = (announcement: Announcement) => {
    setEditingAnnouncement(announcement);
    setFormData({
      title: announcement.title,
      content: announcement.content,
      type: announcement.type as AnnouncementType,
      isActive: announcement.isActive ?? true,
    });
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <h2 className="text-lg font-medium">公告列表</h2>
        <Button onClick={() => setShowCreateDialog(true)}>
          <Plus className="w-4 h-4 mr-1" />
          新增公告
        </Button>
      </div>

      {/* Announcements List */}
      {isLoading ? (
        <div className="space-y-4">
          {[...Array(3)].map((_, i) => (
            <Skeleton key={i} className="h-20 w-full" />
          ))}
        </div>
      ) : announcements?.length === 0 ? (
        <div className="text-center py-12 text-muted-foreground">
          尚無公告
        </div>
      ) : (
        <div className="space-y-4">
          {announcements?.map((announcement) => (
            <div
              key={announcement.id}
              className="p-4 border border-border bg-card"
            >
              <div className="flex items-start justify-between gap-4">
                <div className="flex-1 min-w-0">
                  <div className="flex items-center gap-2 mb-2">
                    <Badge variant={announcement.isActive ? "default" : "secondary"}>
                      {announcement.isActive ? "顯示中" : "已隱藏"}
                    </Badge>
                    <Badge variant="outline">
                      {ANNOUNCEMENT_TYPE_LABELS[announcement.type as AnnouncementType]}
                    </Badge>
                  </div>
                  <p className="font-medium">{announcement.title}</p>
                  <p className="text-sm text-muted-foreground mt-1 line-clamp-2">
                    {announcement.content}
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => openEditDialog(announcement)}
                  >
                    <Edit className="w-4 h-4" />
                  </Button>
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => {
                      if (confirm("確定要刪除此公告嗎？")) {
                        deleteMutation.mutate({ id: announcement.id });
                      }
                    }}
                  >
                    <Trash2 className="w-4 h-4 text-destructive" />
                  </Button>
                </div>
              </div>
            </div>
          ))}
        </div>
      )}

      {/* Create/Edit Dialog */}
      <Dialog
        open={showCreateDialog || !!editingAnnouncement}
        onOpenChange={() => {
          setShowCreateDialog(false);
          setEditingAnnouncement(null);
          resetForm();
        }}
      >
        <DialogContent>
          <DialogHeader>
            <DialogTitle>
              {editingAnnouncement ? "編輯公告" : "新增公告"}
            </DialogTitle>
          </DialogHeader>

          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="title">標題</Label>
              <Input
                id="title"
                value={formData.title}
                onChange={(e) => setFormData({ ...formData, title: e.target.value })}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="content">內容</Label>
              <Textarea
                id="content"
                value={formData.content}
                onChange={(e) => setFormData({ ...formData, content: e.target.value })}
                rows={4}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>類型</Label>
                <Select
                  value={formData.type}
                  onValueChange={(value) =>
                    setFormData({ ...formData, type: value as AnnouncementType })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    {(Object.keys(ANNOUNCEMENT_TYPE_LABELS) as AnnouncementType[]).map(
                      (type) => (
                        <SelectItem key={type} value={type}>
                          {ANNOUNCEMENT_TYPE_LABELS[type]}
                        </SelectItem>
                      )
                    )}
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label>狀態</Label>
                <Select
                  value={formData.isActive ? "active" : "inactive"}
                  onValueChange={(value) =>
                    setFormData({ ...formData, isActive: value === "active" })
                  }
                >
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="active">顯示</SelectItem>
                    <SelectItem value="inactive">隱藏</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>

          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => {
                setShowCreateDialog(false);
                setEditingAnnouncement(null);
                resetForm();
              }}
            >
              取消
            </Button>
            <Button
              onClick={editingAnnouncement ? handleUpdate : handleCreate}
              disabled={createMutation.isPending || updateMutation.isPending}
            >
              {editingAnnouncement ? "更新" : "建立"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
}

// Stats Panel
function StatsPanel() {
  const { data: stats, isLoading } = trpc.stats.get.useQuery();

  if (isLoading) {
    return (
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        {[...Array(3)].map((_, i) => (
          <Skeleton key={i} className="h-32" />
        ))}
      </div>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
      <div className="p-6 border border-border bg-card text-center">
        <p className="text-4xl font-light mb-2">{stats?.totalBrands || 0}</p>
        <p className="label-caps">收錄品牌</p>
      </div>
      <div className="p-6 border border-border bg-card text-center">
        <p className="text-4xl font-light mb-2">{stats?.pendingSubmissions || 0}</p>
        <p className="label-caps">待審核投稿</p>
      </div>
      <div className="p-6 border border-border bg-card text-center">
        <p className="text-4xl font-light mb-2">{stats?.totalUsers || 0}</p>
        <p className="label-caps">註冊用戶</p>
      </div>
    </div>
  );
}
