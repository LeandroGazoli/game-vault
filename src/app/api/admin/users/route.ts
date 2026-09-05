import { NextRequest, NextResponse } from "next/server";
import { requireAdminUser } from "@/lib/serverAuth";
import {
  getAllUsersForAdmin,
  updateUserPlanByAdmin,
  updateUserModerationByAdmin,
  recordAuditLog,
  getUserProfileByUsername,
  saveUserProfile,
} from "@/lib/firebase";
import { UserPlan, UserProfile } from "@/lib/types";

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

export async function POST(request: NextRequest) {
  try {
    const authCheck = await requireAdminUser(request);
    if (!authCheck.authenticated || !authCheck.user) {
      return NextResponse.json(
        { error: authCheck.error || "Acesso restrito a administradores." },
        { status: authCheck.status }
      );
    }

    const body = await request.json();
    const {
      email,
      password,
      username,
      displayName,
      plan = "free",
      isAdmin = false,
      bio,
      sendVerificationEmail = false,
    } = body;

    // 1. Validação de E-mail
    const cleanEmail = (email || "").trim().toLowerCase();
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!cleanEmail || !emailRegex.test(cleanEmail)) {
      return NextResponse.json(
        { error: "Forneça um endereço de e-mail válido." },
        { status: 400 }
      );
    }

    // 2. Validação de Senha
    if (!password || typeof password !== "string" || password.length < 6) {
      return NextResponse.json(
        { error: "A senha inicial deve ter no mínimo 6 caracteres." },
        { status: 400 }
      );
    }

    // 3. Validação de Username
    const rawUsername = (username || "").trim().toLowerCase();
    const cleanUsername = rawUsername.replace(/^@/, "");
    if (!cleanUsername || cleanUsername.length < 3 || cleanUsername.length > 30) {
      return NextResponse.json(
        { error: "O nome de usuário deve ter entre 3 e 30 caracteres." },
        { status: 400 }
      );
    }

    if (!/^[a-z0-9_.-]+$/.test(cleanUsername)) {
      return NextResponse.json(
        { error: "O nome de usuário deve conter apenas letras minúsculas, números, pontos, hífens e sublinhados (_)." },
        { status: 400 }
      );
    }

    // 4. Validação de Plano
    const targetPlan: UserPlan = ["free", "pro", "vip"].includes(plan) ? plan : "free";

    // 5. Verificar se o Username já está em uso no Firestore
    const existingUser = await getUserProfileByUsername(cleanUsername);
    if (existingUser) {
      return NextResponse.json(
        { error: `O nome de usuário @${cleanUsername} já está cadastrado na plataforma.` },
        { status: 400 }
      );
    }

    const apiKey = process.env.NEXT_PUBLIC_FIREBASE_API_KEY;
    if (!apiKey) {
      return NextResponse.json(
        { error: "Configuração do Firebase API Key indisponível no servidor." },
        { status: 500 }
      );
    }

    // 6. Criação da conta de autenticação no Firebase via Google Identity Toolkit REST API
    const signUpUrl = `https://identitytoolkit.googleapis.com/v1/accounts:signUp?key=${apiKey}`;
    const signUpRes = await fetch(signUpUrl, {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        email: cleanEmail,
        password,
        displayName: (displayName || cleanUsername).trim(),
        returnSecureToken: true,
      }),
    });

    if (!signUpRes.ok) {
      const errorData = await signUpRes.json().catch(() => ({}));
      const rawError = errorData?.error?.message || "Erro ao registrar usuário no Firebase Auth.";

      let userFriendlyError = rawError;
      if (rawError.includes("EMAIL_EXISTS")) {
        userFriendlyError = "Este endereço de e-mail já está cadastrado na plataforma.";
      } else if (rawError.includes("WEAK_PASSWORD")) {
        userFriendlyError = "A senha fornecida é muito fraca. Deve ter no mínimo 6 caracteres.";
      } else if (rawError.includes("INVALID_EMAIL")) {
        userFriendlyError = "O formato do e-mail é inválido.";
      }

      return NextResponse.json({ error: userFriendlyError }, { status: 400 });
    }

    const signUpData = await signUpRes.json();
    const localId = signUpData.localId; // UID oficial do Firebase
    const idToken = signUpData.idToken;

    // 7. Disparo opcional de e-mail de verificação oficial
    if (sendVerificationEmail && idToken) {
      try {
        const sendOobUrl = `https://identitytoolkit.googleapis.com/v1/accounts:sendOobCode?key=${apiKey}`;
        await fetch(sendOobUrl, {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            requestType: "VERIFY_EMAIL",
            idToken,
          }),
        });
      } catch (emailErr) {
        console.warn("[Admin User Creation] Falha ao enviar e-mail de verificação:", emailErr);
      }
    }

    // 8. Criação do perfil completo no Firestore
    const now = new Date().toISOString();
    const isUserAdmin = Boolean(isAdmin);
    const isPremium = targetPlan === "pro" || targetPlan === "vip" || isUserAdmin;

    const newProfile: UserProfile = {
      uid: localId,
      email: cleanEmail,
      username: cleanUsername,
      displayName: (displayName || cleanUsername).trim(),
      photoURL: null,
      bio: (bio || "Novo jogador no MyGameList!").trim(),
      plan: targetPlan,
      isPremium,
      isAdmin: isUserAdmin,
      hideAds: isPremium,
      createdAt: now,
      updatedAt: now,
      banned: false,
      suspended: false,
    };

    await saveUserProfile(localId, newProfile);

    // 9. Registro imutável de auditoria administrativa
    const adminEmail = authCheck.user.email;
    const adminUid = authCheck.user.uid;

    await recordAuditLog({
      adminEmail,
      adminUid,
      action: "Novo Usuário Criado no Painel",
      category: "users",
      targetId: localId,
      targetName: newProfile.displayName || newProfile.username,
      details: {
        email: cleanEmail,
        username: cleanUsername,
        plan: targetPlan,
        isAdmin: isUserAdmin,
        sendVerificationEmail: Boolean(sendVerificationEmail),
      },
    });

    return NextResponse.json({ success: true, user: newProfile }, { status: 201 });
  } catch (error: any) {
    console.error("Erro na API /api/admin/users [POST]:", error);
    return NextResponse.json(
      { error: "Erro interno no servidor ao criar usuário." },
      { status: 500 }
    );
  }
}
