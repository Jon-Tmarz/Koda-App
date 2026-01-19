// src/components/setup/user-management-card.tsx
"use client";

import { useEffect, useState } from "react";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { UserProfile } from "@/types";
import { getUserProfiles, deleteUserProfile, changeUserRole } from "@/lib/users-service";
import { useToast } from "@/hooks/use-toast";
import UserFormDialog from "./user-form-dialog";
import { Trash2, Shield, ShieldOff, AlertCircle } from "lucide-react";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";

export default function UserManagementCard() {
  const [profiles, setProfiles] = useState<UserProfile[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();
  const usersHeader = ["UID", "Nombre", "Rol", "Último acceso", "Acciones"]

  const loadProfiles = async () => {
    try {
      setLoading(true);
      const data = await getUserProfiles();
      setProfiles(data);
    } catch (_error) {
      toast({
        title: "Error",
        description: "No se pudieron cargar los perfiles de usuarios.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadProfiles();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const handleDelete = async (uid: string, nombre: string) => {
    if (!confirm(`¿Estás seguro de eliminar el perfil de "${nombre}"?\n\nNota: Esto NO elimina al usuario de Firebase Authentication.`)) {
      return;
    }

    try {
      await deleteUserProfile(uid);
      toast({
        title: "Perfil eliminado",
        description: "El perfil se ha eliminado correctamente.",
        duration: 3000,
      });
      loadProfiles();
    } catch (_error) {
      toast({
        title: "Error",
        description: "No se pudo eliminar el perfil.",
        variant: "destructive",
      });
    }
  };

  const handleRoleChange = async (uid: string, newRole: "admin" | "user") => {
    try {
      await changeUserRole(uid, newRole);
      toast({
        title: "Rol actualizado",
        description: "El rol del usuario se ha actualizado correctamente.",
        duration: 3000,
      });
      loadProfiles();
    } catch (_error) {
      toast({
        title: "Error",
        description: "No se pudo actualizar el rol del usuario.",
        variant: "destructive",
      });
    }
  };

  const formatDate = (date?: Date) => {
    if (!date) return "-";
    return new Intl.DateTimeFormat("es-ES", {
      year: "numeric",
      month: "short",
      day: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  return (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
        <div>
          <CardTitle>Perfiles de Usuario</CardTitle>
          <CardDescription>
            Gestiona los roles de los usuarios registrados en la aplicación
          </CardDescription>
        </div>
        <UserFormDialog onUserSaved={loadProfiles} />
      </CardHeader>
      <CardContent>
        <div className="mb-4 rounded-lg border border-blue-200 bg-blue-50 p-4">
          <div className="flex gap-2">
            <AlertCircle className="h-5 w-5 text-blue-600 flex-shrink-0 mt-0.5" />
            <div className="text-sm text-blue-800">
              <p className="font-semibold mb-1">ℹ️ Gestión simplificada</p>
              <p>Los usuarios se registran normalmente en la aplicación. Aquí solo se gestionan sus <strong>roles</strong> (admin/user).</p>
              <p className="mt-2">Para funcionalidades avanzadas (crear usuarios, deshabilitar cuentas, etc.), considera instalar <strong>Firebase Extensions</strong>.</p>
            </div>
          </div>
        </div>

        {loading ? (
          <div className="flex justify-center py-8">
            <p className="text-muted-foreground">Cargando perfiles...</p>
          </div>
        ) : profiles.length === 0 ? (
          <div className="flex flex-col items-center justify-center py-8 text-center">
            <p className="text-muted-foreground mb-2">No hay perfiles registrados</p>
            <p className="text-sm text-muted-foreground">Los perfiles se crean automáticamente cuando un usuario se registra</p>
          </div>
        ) : (
          <div className="rounded-md border">
            <Table>
              <TableHeader>
                <TableRow>
                  {usersHeader.map((header, index) => (
                    <TableHead key={index} className={header === "Acciones" ? "text-right" : ""}>
                      {header}
                    </TableHead>
                  ))}
                </TableRow>
              </TableHeader>
              <TableBody>
                {profiles.map((profile) => (
                  <TableRow key={profile.uid}>
                    <TableCell className="font-mono text-xs max-w-[120px] truncate" title={profile.uid}>
                      {profile.uid.substring(0, 12)}...
                    </TableCell>
                    <TableCell className="font-medium">{profile.nombre}</TableCell>
                    <TableCell>
                      <Select
                        value={profile.rol}
                        onValueChange={(value: "admin" | "user") =>
                          profile.uid && handleRoleChange(profile.uid, value)
                        }
                      >
                        <SelectTrigger className="w-[130px]">
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="user">
                            <div className="flex items-center gap-2">
                              <Shield className="h-4 w-4 text-blue-500" />
                              Usuario
                            </div>
                          </SelectItem>
                          <SelectItem value="admin">
                            <div className="flex items-center gap-2">
                              <ShieldOff className="h-4 w-4 text-purple-500" />
                              Admin
                            </div>
                          </SelectItem>
                        </SelectContent>
                      </Select>
                    </TableCell>
                    <TableCell className="text-muted-foreground text-sm">
                      {formatDate(profile.ultimoAcceso)}
                    </TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <UserFormDialog user={profile} onUserSaved={loadProfiles} />
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => profile.uid && handleDelete(profile.uid, profile.nombre)}
                        >
                          <Trash2 className="h-4 w-4 text-destructive" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          </div>
        )}

        {/* Estadísticas */}
        {profiles.length > 0 && (
          <div className="mt-6 grid grid-cols-2 gap-4">
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Total perfiles</p>
              <p className="text-2xl font-bold">{profiles.length}</p>
            </div>
            <div className="rounded-lg border p-4">
              <p className="text-sm text-muted-foreground">Administradores</p>
              <p className="text-2xl font-bold text-purple-500">
                {profiles.filter((p) => p.rol === "admin").length}
              </p>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}
