import { NextRequest, NextResponse } from "next/server";
import { getRestFirestore } from "@/lib/firestoreAdminRest";
import { withSharedCache } from "@/lib/edgeCache";
import { UserProfile, levelFromXp } from "@/lib/types";

export const revalidate = 1800; // 30 minutos

export async function GET(request: NextRequest) {
  const { searchParams } = new URL(request.url);
  const rawLimit = parseInt(searchParams.get("limit") || "50", 10);
  const limit = Math.min(Math.max(isNaN(rawLimit) ? 50 : rawLimit, 10), 100);

  try {
    // Cache de 30 minutos em duas camadas (Cache API local + KV global).
    // Evita 100 leituras do Firestore por visitante na página de ranking.
    const leaderboard = await withSharedCache<UserProfile[]>(
      "rankings",
      "community-top100",
      1800,
      async () => {
        const snap = await getRestFirestore()
          .collection("users")
          .orderBy("gamerXp", "desc")
          .limit(100)
          .get();

        const list: UserProfile[] = [];
        for (const docSnap of snap.docs) {
          const u = docSnap.data() as UserProfile;
          if (u.username && u.isPublic !== false && u.visibility?.isPublic !== false) {
            const xp = typeof u.gamerXp === "number" ? u.gamerXp : 0;
            const level = typeof u.gamerLevel === "number" ? u.gamerLevel : levelFromXp(xp);

            // Sanitização de dados públicos (sem PII)
            list.push({
              uid: u.uid || docSnap.id,
              username: u.username,
              displayName: u.displayName || u.username,
              photoURL: u.photoURL || null,
              bannerURL: u.bannerURL || null,
              plan: u.plan || "free",
              gamerXp: xp,
              gamerLevel: level,
              isVerified: Boolean(u.isVerified),
              customTitles: u.customTitles || (u.customTitle ? [u.customTitle] : []),
              createdAt: u.createdAt || "",
            } as UserProfile);
          }
        }

        return list.sort((a, b) => (b.gamerXp || 0) - (a.gamerXp || 0));
      }
    );

    const safeList = Array.isArray(leaderboard) ? leaderboard.slice(0, limit) : [];

    return NextResponse.json(
      { gamers: safeList, total: safeList.length },
      {
        headers: {
          "Cache-Control": "public, s-maxage=1800, stale-while-revalidate=86400",
        },
      }
    );
  } catch (error) {
    console.error("[api/rankings/community] Erro:", error);
    return NextResponse.json({ gamers: [], total: 0 }, { status: 200 });
  }
}
