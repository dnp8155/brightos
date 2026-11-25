import { NextRequest, NextResponse } from "next/server";
import { IntegrationsHubService } from "@/packages/integrations/services/integrations-hub-service";
import { IntegrationProviderId } from "@/packages/integrations/types/integrations";

export async function GET() {
  try {
    const integrations = await IntegrationsHubService.listIntegrations();
    return NextResponse.json({
      success: true,
      providers: IntegrationsHubService.PROVIDERS,
      integrations
    });
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Failed to fetch integrations catalog" },
      { status: 500 }
    );
  }
}

export async function POST(req: NextRequest) {
  try {
    const body = await req.json();
    const { action, providerId, secretValue } = body;

    if (!providerId) {
      return NextResponse.json(
        { success: false, error: "providerId is required" },
        { status: 400 }
      );
    }

    if (action === "test") {
      const result = await IntegrationsHubService.testConnection(providerId as IntegrationProviderId);
      return NextResponse.json({ success: true, result });
    }

    if (action === "save_credential") {
      if (!secretValue) {
        return NextResponse.json(
          { success: false, error: "secretValue is required" },
          { status: 400 }
        );
      }
      const saved = await IntegrationsHubService.saveEncryptedCredential(
        providerId as IntegrationProviderId,
        secretValue
      );
      return NextResponse.json({ ...saved });
    }

    return NextResponse.json(
      { success: false, error: "Invalid action. Use 'test' or 'save_credential'" },
      { status: 400 }
    );
  } catch (err: any) {
    return NextResponse.json(
      { success: false, error: err.message || "Action failed" },
      { status: 500 }
    );
  }
}
