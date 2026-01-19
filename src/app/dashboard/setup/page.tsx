import FirestoreStatusCard from "@/components/setup/firestore-status-card";
import GlobalConfigCard from "@/components/setup/global-config-card";
import APIKeysManager from "@/components/setup/api-keys-manager";
import UserManagementCard from "@/components/setup/user-management-card";

export default function SetupPage() {
  return (
    <div className="space-y-6">
      <div>
        <h2 className="text-3xl font-bold tracking-tight">Configuración</h2>
        <p className="text-muted-foreground">
          Ajusta la configuración global del sistema
        </p>
      </div>

      <FirestoreStatusCard />
      <GlobalConfigCard />
      <APIKeysManager />
      <UserManagementCard />
    </div>
  );
}
