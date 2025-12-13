import { COOKIE_NAME } from "@shared/const";
import { getSessionCookieOptions } from "./_core/cookies";
import { systemRouter } from "./_core/systemRouter";
import { publicProcedure, protectedProcedure, router } from "./_core/trpc";
import { z } from "zod";
import { TRPCError } from "@trpc/server";
import { 
  getAllBrands, getBrandById, createBrand, updateBrand, deleteBrand,
  createSubmission, getSubmissionsByStatus, getSubmissionById, updateSubmissionStatus, updateSubmissionLLMValidation,
  getActiveAnnouncements, getAllAnnouncements, createAnnouncement, updateAnnouncement, deleteAnnouncement,
  getStatistics
} from "./db";
import { invokeLLM } from "./_core/llm";
import { notifyOwner } from "./_core/notification";

// Admin procedure - only allows admin users
const adminProcedure = protectedProcedure.use(({ ctx, next }) => {
  if (ctx.user.role !== 'admin') {
    throw new TRPCError({ code: 'FORBIDDEN', message: '需要管理員權限' });
  }
  return next({ ctx });
});

// Brand filter schema
const brandFiltersSchema = z.object({
  search: z.string().optional(),
  pasteurizationType: z.array(z.enum(["LTLT", "HTST", "UHT", "ESL"])).optional(),
  physicalChannels: z.array(z.string()).optional(),
  onlineChannels: z.array(z.string()).optional(),
  minPrice: z.number().optional(),
  maxPrice: z.number().optional(),
  isOrganic: z.boolean().optional(),
  isImported: z.boolean().optional(),
});

// Brand input schema
const brandInputSchema = z.object({
  brandName: z.string().min(1),
  productName: z.string().min(1),
  pasteurizationType: z.enum(["LTLT", "HTST", "UHT", "ESL"]),
  volume: z.number().int().positive(),
  shelfLife: z.number().int().positive().optional(),
  price: z.number().int().positive().optional(),
  origin: z.string().optional(),
  ingredients: z.string().optional(),
  officialWebsite: z.string().url().optional().or(z.literal("")),
  imageUrl: z.string().optional(),
  imageKey: z.string().optional(),
  physicalChannels: z.array(z.string()).optional(),
  onlineChannels: z.array(z.string()).optional(),
  notes: z.string().optional(),
  isOrganic: z.boolean().optional(),
  isImported: z.boolean().optional(),
});

// Submission content schema
const submissionContentSchema = z.object({
  brandName: z.string().optional(),
  productName: z.string().optional(),
  pasteurizationType: z.string().optional(),
  volume: z.number().optional(),
  shelfLife: z.number().optional(),
  price: z.number().optional(),
  origin: z.string().optional(),
  ingredients: z.string().optional(),
  officialWebsite: z.string().optional(),
  physicalChannels: z.array(z.string()).optional(),
  onlineChannels: z.array(z.string()).optional(),
  notes: z.string().optional(),
  isOrganic: z.boolean().optional(),
  isImported: z.boolean().optional(),
  updateDescription: z.string().optional(),
});

export const appRouter = router({
  system: systemRouter,
  
  auth: router({
    me: publicProcedure.query(opts => opts.ctx.user),
    logout: publicProcedure.mutation(({ ctx }) => {
      const cookieOptions = getSessionCookieOptions(ctx.req);
      ctx.res.clearCookie(COOKIE_NAME, { ...cookieOptions, maxAge: -1 });
      return { success: true } as const;
    }),
  }),

  // ============ Brand Routes ============
  brands: router({
    list: publicProcedure
      .input(brandFiltersSchema.optional())
      .query(async ({ input }) => {
        return await getAllBrands(input);
      }),

    getById: publicProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const brand = await getBrandById(input.id);
        if (!brand) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '找不到該品牌' });
        }
        return brand;
      }),

    create: adminProcedure
      .input(brandInputSchema)
      .mutation(async ({ input }) => {
        const id = await createBrand({
          ...input,
          officialWebsite: input.officialWebsite || null,
        });
        return { id };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        data: brandInputSchema.partial(),
      }))
      .mutation(async ({ input }) => {
        await updateBrand(input.id, input.data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteBrand(input.id);
        return { success: true };
      }),

    // Get unique values for filters
    getFilterOptions: publicProcedure.query(async () => {
      const brands = await getAllBrands();
      
      const physicalChannelsSet = new Set<string>();
      const onlineChannelsSet = new Set<string>();
      
      brands.forEach(brand => {
        (brand.physicalChannels || []).forEach(c => physicalChannelsSet.add(c));
        (brand.onlineChannels || []).forEach(c => onlineChannelsSet.add(c));
      });

      return {
        pasteurizationTypes: ["LTLT", "HTST", "UHT", "ESL"],
        physicalChannels: Array.from(physicalChannelsSet).sort(),
        onlineChannels: Array.from(onlineChannelsSet).sort(),
      };
    }),
  }),

  // ============ Submission Routes ============
  submissions: router({
    create: publicProcedure
      .input(z.object({
        submissionType: z.enum(["brand", "update", "image"]),
        relatedBrandId: z.number().optional(),
        content: submissionContentSchema,
        submitterName: z.string().optional(),
        submitterEmail: z.string().email().optional(),
        imageUrl: z.string().optional(),
        imageKey: z.string().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await createSubmission({
          userId: ctx.user?.id,
          submitterName: input.submitterName,
          submitterEmail: input.submitterEmail,
          submissionType: input.submissionType,
          relatedBrandId: input.relatedBrandId,
          content: input.content,
          imageUrl: input.imageUrl,
          imageKey: input.imageKey,
        });

        // Validate with LLM
        try {
          const validationResult = await validateSubmissionWithLLM(input.content, input.submissionType);
          await updateSubmissionLLMValidation(id, validationResult);
        } catch (error) {
          console.error("LLM validation failed:", error);
        }

        // Notify owner
        try {
          await notifyOwner({
            title: "新投稿通知",
            content: `收到新的${input.submissionType === 'brand' ? '品牌' : input.submissionType === 'update' ? '更新' : '圖片'}投稿：${input.content.brandName || input.content.productName || '未命名'}`,
          });
        } catch (error) {
          console.error("Failed to notify owner:", error);
        }

        return { id };
      }),

    // Admin: get pending submissions
    getPending: adminProcedure.query(async () => {
      return await getSubmissionsByStatus("pending");
    }),

    // Admin: get all submissions by status
    getByStatus: adminProcedure
      .input(z.object({ status: z.enum(["pending", "approved", "rejected"]) }))
      .query(async ({ input }) => {
        return await getSubmissionsByStatus(input.status);
      }),

    // Admin: get submission details
    getById: adminProcedure
      .input(z.object({ id: z.number() }))
      .query(async ({ input }) => {
        const submission = await getSubmissionById(input.id);
        if (!submission) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '找不到該投稿' });
        }
        return submission;
      }),

    // Admin: approve submission
    approve: adminProcedure
      .input(z.object({
        id: z.number(),
        reviewNotes: z.string().optional(),
        applyToBrand: z.boolean().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const submission = await getSubmissionById(input.id);
        if (!submission) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '找不到該投稿' });
        }

        // If approved and should apply to brand
        if (input.applyToBrand && submission.submissionType === 'brand') {
          const content = submission.content as Record<string, unknown>;
          await createBrand({
            brandName: content.brandName as string,
            productName: content.productName as string,
            pasteurizationType: content.pasteurizationType as "LTLT" | "HTST" | "UHT" | "ESL",
            volume: content.volume as number,
            shelfLife: content.shelfLife as number | undefined,
            price: content.price as number | undefined,
            origin: content.origin as string | undefined,
            ingredients: content.ingredients as string | undefined,
            officialWebsite: content.officialWebsite as string | undefined,
            physicalChannels: content.physicalChannels as string[] | undefined,
            onlineChannels: content.onlineChannels as string[] | undefined,
            notes: content.notes as string | undefined,
            isOrganic: content.isOrganic as boolean | undefined,
            isImported: content.isImported as boolean | undefined,
            imageUrl: submission.imageUrl || undefined,
            imageKey: submission.imageKey || undefined,
          });
        } else if (input.applyToBrand && submission.submissionType === 'update' && submission.relatedBrandId) {
          const content = submission.content as Record<string, unknown>;
          await updateBrand(submission.relatedBrandId, content);
        } else if (input.applyToBrand && submission.submissionType === 'image' && submission.relatedBrandId) {
          await updateBrand(submission.relatedBrandId, {
            imageUrl: submission.imageUrl || undefined,
            imageKey: submission.imageKey || undefined,
          });
        }

        await updateSubmissionStatus(input.id, "approved", ctx.user.id, input.reviewNotes);
        return { success: true };
      }),

    // Admin: reject submission
    reject: adminProcedure
      .input(z.object({
        id: z.number(),
        reviewNotes: z.string(),
      }))
      .mutation(async ({ input, ctx }) => {
        await updateSubmissionStatus(input.id, "rejected", ctx.user.id, input.reviewNotes);
        return { success: true };
      }),

    // Re-validate with LLM
    revalidate: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        const submission = await getSubmissionById(input.id);
        if (!submission) {
          throw new TRPCError({ code: 'NOT_FOUND', message: '找不到該投稿' });
        }

        const validationResult = await validateSubmissionWithLLM(
          submission.content as Record<string, unknown>,
          submission.submissionType
        );
        await updateSubmissionLLMValidation(input.id, validationResult);
        return validationResult;
      }),
  }),

  // ============ Announcement Routes ============
  announcements: router({
    getActive: publicProcedure.query(async () => {
      return await getActiveAnnouncements();
    }),

    getAll: adminProcedure.query(async () => {
      return await getAllAnnouncements();
    }),

    create: adminProcedure
      .input(z.object({
        title: z.string().min(1),
        content: z.string().min(1),
        type: z.enum(["info", "update", "important"]).optional(),
        isActive: z.boolean().optional(),
        displayOrder: z.number().optional(),
        startDate: z.date().optional(),
        endDate: z.date().optional(),
      }))
      .mutation(async ({ input, ctx }) => {
        const id = await createAnnouncement({
          ...input,
          createdBy: ctx.user.id,
        });
        return { id };
      }),

    update: adminProcedure
      .input(z.object({
        id: z.number(),
        data: z.object({
          title: z.string().optional(),
          content: z.string().optional(),
          type: z.enum(["info", "update", "important"]).optional(),
          isActive: z.boolean().optional(),
          displayOrder: z.number().optional(),
          startDate: z.date().optional(),
          endDate: z.date().optional(),
        }),
      }))
      .mutation(async ({ input }) => {
        await updateAnnouncement(input.id, input.data);
        return { success: true };
      }),

    delete: adminProcedure
      .input(z.object({ id: z.number() }))
      .mutation(async ({ input }) => {
        await deleteAnnouncement(input.id);
        return { success: true };
      }),
  }),

  // ============ Statistics Routes ============
  stats: router({
    get: publicProcedure.query(async () => {
      return await getStatistics();
    }),
  }),
});

// LLM Validation Helper
async function validateSubmissionWithLLM(
  content: Record<string, unknown>,
  submissionType: string
): Promise<{
  isValid: boolean;
  confidence: number;
  issues: string[];
  suggestions: string[];
}> {
  const prompt = `你是一個台灣鮮乳產品資訊驗證專家。請驗證以下${submissionType === 'brand' ? '新品牌' : submissionType === 'update' ? '更新' : '圖片'}投稿資訊的準確性和完整性。

投稿內容：
${JSON.stringify(content, null, 2)}

請檢查以下項目：
1. 品牌名稱和產品名稱是否合理（是否為真實存在的台灣鮮乳品牌）
2. 殺菌方式是否正確（LTLT/HTST/UHT/ESL）
3. 容量是否合理（常見為 200ml, 290ml, 400ml, 500ml, 936ml, 1000ml, 1858ml, 1892ml 等）
4. 保存期限是否合理（LTLT/HTST 通常 7-14 天，UHT 可達數月）
5. 價格是否在合理範圍內
6. 通路資訊是否正確

請以 JSON 格式回覆：
{
  "isValid": true/false,
  "confidence": 0-100 的數字,
  "issues": ["問題1", "問題2"],
  "suggestions": ["建議1", "建議2"]
}`;

  try {
    const response = await invokeLLM({
      messages: [
        { role: "system", content: "你是一個專業的台灣鮮乳產品資訊驗證專家，請以 JSON 格式回覆驗證結果。" },
        { role: "user", content: prompt },
      ],
      response_format: {
        type: "json_schema",
        json_schema: {
          name: "validation_result",
          strict: true,
          schema: {
            type: "object",
            properties: {
              isValid: { type: "boolean" },
              confidence: { type: "number" },
              issues: { type: "array", items: { type: "string" } },
              suggestions: { type: "array", items: { type: "string" } },
            },
            required: ["isValid", "confidence", "issues", "suggestions"],
            additionalProperties: false,
          },
        },
      },
    });

    const messageContent = response.choices[0].message.content;
    const contentStr = typeof messageContent === 'string' ? messageContent : JSON.stringify(messageContent);
    const result = JSON.parse(contentStr || "{}");
    return {
      isValid: result.isValid ?? false,
      confidence: result.confidence ?? 0,
      issues: result.issues ?? [],
      suggestions: result.suggestions ?? [],
    };
  } catch (error) {
    console.error("LLM validation error:", error);
    return {
      isValid: false,
      confidence: 0,
      issues: ["無法完成 LLM 驗證"],
      suggestions: ["請手動審核此投稿"],
    };
  }
}

export type AppRouter = typeof appRouter;
