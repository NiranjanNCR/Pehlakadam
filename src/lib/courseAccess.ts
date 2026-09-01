// =========================================================================================
// 🎓 PEHLAKADAM LMS - CATEGORY & TIERED ACCESS CONTROL ENGINE
// =========================================================================================

export type UserTier = "basic" | "advance" | "pro";

export const SYSTEM_LMS_CATEGORIES = [
  "Primary Kudos",
  "6-8 Grade Student",
  "8-10 Grade Student",
  "11-12 Grade Student",
  "UG/Graduate/PG",
  "Generalist to Specialist"
] as const;

export type LMSCategory = typeof SYSTEM_LMS_CATEGORIES[number];

/**
 * Normalizes tier strings into canonical 'basic' | 'advance' | 'pro'
 */
export function normalizeTier(tierStr?: string | null): UserTier {
  if (!tierStr) return "basic";
  const s = String(tierStr).toLowerCase().trim();
  if (s === "pro" || s === "premium pro" || s === "premium" || s === "3") return "pro";
  if (s === "advance" || s === "advanced" || s === "standard" || s === "2") return "advance";
  return "basic";
}

export const TIER_HIERARCHY: Record<UserTier, number> = {
  basic: 1,
  advance: 2,
  pro: 3
};

/**
 * Maps varying naming conventions (e.g., '6-8', '6-8 Grade Student', '6th to 8th')
 * to a canonical program key.
 */
export function getCanonicalProgramKey(nameOrKey?: string | null): string {
  if (!nameOrKey) return "";
  const s = String(nameOrKey).toLowerCase().trim();
  if (s.includes("kudos") || s.includes("primary")) return "kudos";
  if (s.includes("6-8") || s.includes("6th-8th") || s.includes("6 to 8") || s.includes("6th to 8th")) return "6-8";
  if (s.includes("8-10") || s.includes("9-10") || s.includes("8th-10th") || s.includes("9th-10th") || s.includes("9 to 10") || s.includes("8 to 10")) return "9-10";
  if (s.includes("11-12") || s.includes("11th-12th") || s.includes("11 to 12") || s.includes("11th to 12th")) return "11-12";
  if (s.includes("ug") || s.includes("graduate") || s.includes("pg") || s.includes("college") || s.includes("university")) return "graduate";
  if (s.includes("generalist") || s.includes("specialist")) return "generalist";
  return s;
}

/**
 * Checks whether a course category matches an enrolled program name or key.
 */
export function doCategoriesMatch(courseCategory?: string | null, programNameOrKey?: string | null): boolean {
  if (!courseCategory || !programNameOrKey) return false;
  const catKey = getCanonicalProgramKey(courseCategory);
  const progKey = getCanonicalProgramKey(programNameOrKey);
  if (catKey && progKey && catKey === progKey) return true;
  const c = String(courseCategory).toLowerCase().trim();
  const p = String(programNameOrKey).toLowerCase().trim();
  return c === p || c.includes(p) || p.includes(c);
}

/**
 * Checks whether a user with given enrolled programs & tier can access a course.
 *
 * Rules:
 * 1. Explicit course ID enrollment (user was explicitly granted this course) -> ACCESS GRANTED.
 * 2. If user is enrolled in program 'all' or '*' -> Tiered access across all courses.
 * 3. Otherwise, course category MUST match at least one enrolled program of the student.
 *    Within that category:
 *    - Basic student -> Basic courses ONLY.
 *    - Advance student -> Basic + Advance courses ONLY.
 *    - Pro student -> Basic + Advance + Pro courses.
 */
export function canUserAccessCourse(params: {
  courseId?: string;
  courseCategory?: string;
  courseTier?: string;
  userTier?: string | null;
  enrolledPrograms?: string[];
  enrolledCourses?: string[];
  isAuthorized?: boolean;
}): boolean {
  const {
    courseId,
    courseCategory,
    courseTier,
    userTier,
    enrolledPrograms = [],
    enrolledCourses = [],
    isAuthorized = false
  } = params;

  if (!isAuthorized) return false;

  // 1. Explicit direct enrollment in this specific course
  if (courseId && enrolledCourses && enrolledCourses.length > 0) {
    const cleanCid = String(courseId).trim();
    const isDirectlyEnrolled = enrolledCourses.some(id => String(id).trim() === cleanCid);
    if (isDirectlyEnrolled) {
      return true;
    }
  }

  const normUserTier = normalizeTier(userTier);
  const normCourseTier = normalizeTier(courseTier);
  const userLevel = TIER_HIERARCHY[normUserTier] || 1;
  const courseLevel = TIER_HIERARCHY[normCourseTier] || 1;

  // Tier check: course requirement must not exceed user tier
  if (courseLevel > userLevel) {
    return false;
  }

  // 2. Global access
  const hasAll = enrolledPrograms.some(p => {
    const s = String(p).toLowerCase().trim();
    return s === "all" || s === "all_programs" || s === "*";
  });
  if (hasAll) {
    return true;
  }

  // 3. Category match check: course MUST belong to user's enrolled program category
  if (!courseCategory || enrolledPrograms.length === 0) {
    return false;
  }

  return enrolledPrograms.some(prog => doCategoriesMatch(courseCategory, prog));
}
