import { eq, and, like, or, gte, lte, desc, asc, sql } from "drizzle-orm";
import { drizzle } from "drizzle-orm/mysql2";
import { 
  InsertUser, users, 
  milkBrands, InsertMilkBrand, MilkBrand,
  submissions, InsertSubmission, Submission,
  announcements, InsertAnnouncement, Announcement
} from "../drizzle/schema";
import { ENV } from './_core/env';

let _db: ReturnType<typeof drizzle> | null = null;

export async function getDb() {
  if (!_db && process.env.DATABASE_URL) {
    try {
      _db = drizzle(process.env.DATABASE_URL);
    } catch (error) {
      console.warn("[Database] Failed to connect:", error);
      _db = null;
    }
  }
  return _db;
}

// ============ User Functions ============
export async function upsertUser(user: InsertUser): Promise<void> {
  if (!user.openId) {
    throw new Error("User openId is required for upsert");
  }

  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot upsert user: database not available");
    return;
  }

  try {
    const values: InsertUser = {
      openId: user.openId,
    };
    const updateSet: Record<string, unknown> = {};

    const textFields = ["name", "email", "loginMethod"] as const;
    type TextField = (typeof textFields)[number];

    const assignNullable = (field: TextField) => {
      const value = user[field];
      if (value === undefined) return;
      const normalized = value ?? null;
      values[field] = normalized;
      updateSet[field] = normalized;
    };

    textFields.forEach(assignNullable);

    if (user.lastSignedIn !== undefined) {
      values.lastSignedIn = user.lastSignedIn;
      updateSet.lastSignedIn = user.lastSignedIn;
    }
    if (user.role !== undefined) {
      values.role = user.role;
      updateSet.role = user.role;
    } else if (user.openId === ENV.ownerOpenId) {
      values.role = 'admin';
      updateSet.role = 'admin';
    }

    if (!values.lastSignedIn) {
      values.lastSignedIn = new Date();
    }

    if (Object.keys(updateSet).length === 0) {
      updateSet.lastSignedIn = new Date();
    }

    await db.insert(users).values(values).onDuplicateKeyUpdate({
      set: updateSet,
    });
  } catch (error) {
    console.error("[Database] Failed to upsert user:", error);
    throw error;
  }
}

export async function getUserByOpenId(openId: string) {
  const db = await getDb();
  if (!db) {
    console.warn("[Database] Cannot get user: database not available");
    return undefined;
  }

  const result = await db.select().from(users).where(eq(users.openId, openId)).limit(1);

  return result.length > 0 ? result[0] : undefined;
}

// ============ Milk Brand Functions ============
export interface BrandFilters {
  search?: string;
  pasteurizationType?: string[];
  physicalChannels?: string[];
  onlineChannels?: string[];
  minPrice?: number;
  maxPrice?: number;
  isOrganic?: boolean;
  isImported?: boolean;
}

export async function getAllBrands(filters?: BrandFilters) {
  const db = await getDb();
  if (!db) return [];

  let query = db.select().from(milkBrands).where(eq(milkBrands.isActive, true));
  
  const conditions = [eq(milkBrands.isActive, true)];

  if (filters?.search) {
    conditions.push(
      or(
        like(milkBrands.brandName, `%${filters.search}%`),
        like(milkBrands.productName, `%${filters.search}%`)
      )!
    );
  }

  if (filters?.pasteurizationType && filters.pasteurizationType.length > 0) {
    conditions.push(
      sql`${milkBrands.pasteurizationType} IN (${sql.join(filters.pasteurizationType.map(t => sql`${t}`), sql`, `)})`
    );
  }

  if (filters?.minPrice !== undefined) {
    conditions.push(gte(milkBrands.price, filters.minPrice));
  }

  if (filters?.maxPrice !== undefined) {
    conditions.push(lte(milkBrands.price, filters.maxPrice));
  }

  if (filters?.isOrganic !== undefined) {
    conditions.push(eq(milkBrands.isOrganic, filters.isOrganic));
  }

  if (filters?.isImported !== undefined) {
    conditions.push(eq(milkBrands.isImported, filters.isImported));
  }

  const result = await db
    .select()
    .from(milkBrands)
    .where(and(...conditions))
    .orderBy(asc(milkBrands.brandName), asc(milkBrands.productName));

  // 在應用層過濾通路
  let filteredResult = result;

  if (filters?.physicalChannels && filters.physicalChannels.length > 0) {
    filteredResult = filteredResult.filter(brand => {
      const channels = brand.physicalChannels || [];
      return filters.physicalChannels!.some(c => channels.includes(c));
    });
  }

  if (filters?.onlineChannels && filters.onlineChannels.length > 0) {
    filteredResult = filteredResult.filter(brand => {
      const channels = brand.onlineChannels || [];
      return filters.onlineChannels!.some(c => channels.includes(c));
    });
  }

  return filteredResult;
}

export async function getBrandById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(milkBrands).where(eq(milkBrands.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function createBrand(brand: InsertMilkBrand) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(milkBrands).values(brand);
  return result[0].insertId;
}

export async function updateBrand(id: number, brand: Partial<InsertMilkBrand>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(milkBrands).set(brand).where(eq(milkBrands.id, id));
}

export async function deleteBrand(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(milkBrands).set({ isActive: false }).where(eq(milkBrands.id, id));
}

// ============ Submission Functions ============
export async function createSubmission(submission: InsertSubmission) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(submissions).values(submission);
  return result[0].insertId;
}

export async function getSubmissionsByStatus(status: "pending" | "approved" | "rejected") {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(submissions)
    .where(eq(submissions.status, status))
    .orderBy(desc(submissions.createdAt));
}

export async function getSubmissionById(id: number) {
  const db = await getDb();
  if (!db) return undefined;

  const result = await db.select().from(submissions).where(eq(submissions.id, id)).limit(1);
  return result.length > 0 ? result[0] : undefined;
}

export async function updateSubmissionStatus(
  id: number, 
  status: "approved" | "rejected", 
  reviewedBy: number,
  reviewNotes?: string
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(submissions).set({
    status,
    reviewedBy,
    reviewedAt: new Date(),
    reviewNotes: reviewNotes || null,
  }).where(eq(submissions.id, id));
}

export async function updateSubmissionLLMValidation(
  id: number,
  llmValidation: {
    isValid: boolean;
    confidence: number;
    issues: string[];
    suggestions: string[];
  }
) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(submissions).set({ llmValidation }).where(eq(submissions.id, id));
}

// ============ Announcement Functions ============
export async function getActiveAnnouncements() {
  const db = await getDb();
  if (!db) return [];

  const now = new Date();
  
  return await db
    .select()
    .from(announcements)
    .where(
      and(
        eq(announcements.isActive, true),
        or(
          sql`${announcements.startDate} IS NULL`,
          lte(announcements.startDate, now)
        ),
        or(
          sql`${announcements.endDate} IS NULL`,
          gte(announcements.endDate, now)
        )
      )
    )
    .orderBy(desc(announcements.displayOrder), desc(announcements.createdAt));
}

export async function getAllAnnouncements() {
  const db = await getDb();
  if (!db) return [];

  return await db
    .select()
    .from(announcements)
    .orderBy(desc(announcements.createdAt));
}

export async function createAnnouncement(announcement: InsertAnnouncement) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  const result = await db.insert(announcements).values(announcement);
  return result[0].insertId;
}

export async function updateAnnouncement(id: number, announcement: Partial<InsertAnnouncement>) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.update(announcements).set(announcement).where(eq(announcements.id, id));
}

export async function deleteAnnouncement(id: number) {
  const db = await getDb();
  if (!db) throw new Error("Database not available");

  await db.delete(announcements).where(eq(announcements.id, id));
}

// ============ Statistics Functions ============
export async function getStatistics() {
  const db = await getDb();
  if (!db) return { totalBrands: 0, pendingSubmissions: 0, totalUsers: 0 };

  const [brandsResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(milkBrands)
    .where(eq(milkBrands.isActive, true));

  const [submissionsResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(submissions)
    .where(eq(submissions.status, "pending"));

  const [usersResult] = await db
    .select({ count: sql<number>`COUNT(*)` })
    .from(users);

  return {
    totalBrands: Number(brandsResult?.count || 0),
    pendingSubmissions: Number(submissionsResult?.count || 0),
    totalUsers: Number(usersResult?.count || 0),
  };
}
