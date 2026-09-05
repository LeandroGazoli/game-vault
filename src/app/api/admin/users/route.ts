import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/serverAuth";
import { getAllUsersForAdmin, updateUserPlanByAdmin, updateUserModerationByAdmin, recordAuditLog } from "@/lib/firebase";
import { UserPlan } from "@/lib/types";

export const dynamic = "force-dynamic";

export async function GET(request: NextRequest) {
  try {
    const authCheck = await requireAdminUser(request);
    if (!authCheck.authenticated || !authCheck.user) {
      return NextResponse.json(
        { error: authCheck.error || "Acesso restrito a administradores." },
        { status: authCheck.status }
      );
    }

    const { searchParams } = new URL(request.url);
    const plan = searchParams.get("plan");
    const query = (searchParams.get("q") || "").toLowerCase().trim();
    const moderation = searchParams.get("moderation"); // 'banned' | 'suspended' | 'active'

    let users = await getAllUsersForAdmin();

    if (plan && plan !== "all") {
      users = users.filter((u) => (u.plan || "free") === plan);
    }

    if (moderation === "banned") {
      users = users.filter((u) => u.banned === true);
    } else if (moderation === "suspended") {
      users = users.filter((u) => u.suspended === true);
    } else if (moderation === "active") {
      users = users.filter((u) => !u.banned && !u.suspended);
    }

    if (query) {
      users = users.filter((u) => {
        const name = (u.displayName || "").toLowerCase();
        const email = (u.email || "").toLowerCase();
        const username = (u.username || "").toLowerCase();
        return name.includes(query) || email.includes(query) || username.includes(query);
      });
    }

    // Contadores analíticos
    const totalUsers = users.length;
    const proCount = users.filter((u) => u.plan === "pro").length;
    const vipCount = users.filter((u) => u.plan === "vip").length;
    const freeCount = users.filter((u) => !u.plan || u.plan === "free").length;
    const bannedCount = users.filter((u) => u.banned).length;

    return NextResponse.json({
      users,
      counts: {
        total: totalUsers,
        pro: proCount,
        vip: vipCount,
        free: freeCount,
        banned: bannedCount,
      },
    });
  } catch (error: any) {
    console.error("Erro na API /api/admin/users [GET]:", error);
    return NextResponse.json(
      { error: "Erro interno ao processar usuários." },
      { status: 500 }
    );
  }
}

export async function PATCH(request: NextRequest) {
  try {
    const authCheck = await requireAdminUser(request);
    if (!authCheck.authenticated || !authCheck.user) {
      return NextResponse.json(
        { error: authCheck.error || "Acesso restrito a administradores." },
        { status: authCheck.status }
      );
    }

    const body = await request.json();
    const { userId, plan, banned, suspended, moderationReason, userDisplayName } = body;

    if (!userId || typeof userId !== "string") {
      return NextResponse.json(
        { error: "ID do usuário é obrigatório." },
        { status: 400 }
      );
    }

    const adminEmail = authCheck.user.email;
    const adminUid = authCheck.user.uid;

    // Atualização de Plano
    if (plan !== undefined) {
      if (!["free", "pro", "vip"].includes(plan)) {
        return NextResponse.json({ error: "Plano inválido." }, { status: 400 });
      }
      await updateUserPlanByAdmin(userId, plan as UserPlan);
      await recordAuditLog({
        adminEmail,
        adminUid,
        action: `Plano alterado para ${plan.toUpperCase()}`,
        category: "plans",
        targetId: userId,
        targetName: userDisplayName || userId,
        details: { newPlan: plan },
      });
    }

    // Atualização de Moderação
    if (banned !== undefined || suspended !== undefined || moderationReason !== undefined) {
      await updateUserModerationByAdmin(userId, {
        banned: banned !== undefined ? Boolean(banned) : undefined,
        suspended: suspended !== undefined ? Boolean(suspended) : undefined,
        moderationReason: moderationReason ? String(moderationReason).slice(0, 500) : null,
      });

      const actionText = banned
        ? "Usuário Banido"
        : suspended
        ? "Usuário Suspenso"
        : "Restrições de Usuário Removidas";

      await recordAuditLog({
        adminEmail,
        adminUid,
        action: actionText,
        category: "users",
        targetId: userId,
        targetName: userDisplayName || userId,
        details: { banned, suspended, reason: moderationReason },
      });
    }

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Erro na API /api/admin/users [PATCH]:", error);
    return NextResponse.json(
      { error: "Erro interno ao atualizar usuário." },
      { status: 500 }
    );
  }
}
