import { NextRequest, NextResponse } from "next/server";
import { getAdminDb, verifyIdToken, adminSaveUserProfile } from "@/lib/firebaseAdmin";
import { ProfileTemplate, ProfileSectionConfig } from "@/lib/types/profile.types";

/**
 * Endpoint para gerenciamento seguro de Template Customizado do Perfil.
 * Valida autorização estrita no servidor: apenas assinantes VIP e PRO podem salvar template customizado.
 * Previne abuso por chamadas manuais à API (anti-BOPLA).
 */
export async function POST(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return NextResponse.json({ error: "Token de autenticação não fornecido." }, { status: 401 });
    }

    const { uid } = await verifyIdToken(token);
    if (!uid) {
      return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
    }

    // 1. Consulta o perfil real do usuário diretamente no banco pelo Admin SDK
    const userDoc = await getAdminDb().collection("users").doc(uid).get();
    if (!userDoc.exists) {
      return NextResponse.json({ error: "Usuário não encontrado." }, { status: 404 });
    }

    const userData = userDoc.data() || {};
    const plan = userData.plan || "free";
    const isPremium = plan === "vip" || plan === "pro" || userData.isPremium === true;

    // 2. Validação estrita de VIP/PRO no backend
    if (!isPremium) {
      return NextResponse.json(
        {
          error: "A criação de template customizado é um benefício exclusivo para assinantes VIP e PRO.",
          requiredPlan: ["vip", "pro"],
        },
        { status: 403 }
      );
    }

    const body = await request.json();
    const { template } = body as { template: ProfileTemplate };

    if (!template || !Array.isArray(template.sections)) {
      return NextResponse.json({ error: "Dados do template inválidos." }, { status: 400 });
    }

    // 3. Sanitiza e valida as seções (garante limite estrito de 1 template ativo)
    const sanitizedSections: ProfileSectionConfig[] = template.sections.map((sec, index) => ({
      id: sec.id,
      label: String(sec.label).slice(0, 50),
      visible: Boolean(sec.visible),
      order: typeof sec.order === "number" ? sec.order : index,
    }));

    const sanitizedTemplate: ProfileTemplate = {
      id: "custom",
      name: String(template.name || "Meu Template Customizado").slice(0, 40),
      description: "Template personalizado do usuário.",
      iconName: "Sliders",
      sections: sanitizedSections,
      isCustom: true,
      isVipProOnly: true,
    };

    // 4. Salva com segurança no perfil do usuário
    await adminSaveUserProfile(uid, {
      customProfileTemplate: sanitizedTemplate,
      activeProfileTemplate: "custom",
      profileSectionsOrder: sanitizedSections,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Template customizado salvo com sucesso!",
      template: sanitizedTemplate,
    });
  } catch (error: any) {
    console.error("[Profile Template API] Erro ao salvar template:", error);
    return NextResponse.json(
      { error: error?.message || "Erro interno ao processar template." },
      { status: 500 }
    );
  }
}

export async function DELETE(request: NextRequest) {
  try {
    const authHeader = request.headers.get("authorization") || "";
    const token = authHeader.startsWith("Bearer ") ? authHeader.slice(7) : "";

    if (!token) {
      return NextResponse.json({ error: "Token não fornecido." }, { status: 401 });
    }

    const { uid } = await verifyIdToken(token);
    if (!uid) {
      return NextResponse.json({ error: "Sessão inválida." }, { status: 401 });
    }

    // Restaura para o template padrão oficial
    await adminSaveUserProfile(uid, {
      customProfileTemplate: null,
      activeProfileTemplate: "tracker",
      profileSectionsOrder: null,
      updatedAt: new Date().toISOString(),
    });

    return NextResponse.json({
      success: true,
      message: "Template restaurado para o padrão oficial com sucesso!",
    });
  } catch (error: any) {
    console.error("[Profile Template API] Erro ao restaurar template:", error);
    return NextResponse.json({ error: "Erro ao restaurar template." }, { status: 500 });
  }
}
