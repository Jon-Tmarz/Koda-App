// src/components/setup/user-form-dialog.tsx
"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { UserProfile } from "@/types";
import { createUserProfile, updateUserProfile } from "@/lib/users-service";
import { useToast } from "@/hooks/use-toast";
import { Edit } from "lucide-react";

interface UserFormDialogProps {
  user?: UserProfile;
  onUserSaved: () => void;
}

export default function UserFormDialog({
  user,
  onUserSaved,
}: UserFormDialogProps) {
  const [open, setOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const { toast } = useToast();
  const userRole = [
    { value: "user", label: "Usuario" },
    { value: "admin", label: "Administrador" },
  ];

  const [formData, setFormData] = useState({
    uid: user?.uid || "",
    nombre: user?.nombre || "",
    rol: user?.rol || ("user" as "admin" | "user"),
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);

    try {
      if (user?.uid) {
        // Actualizar perfil existente
        await updateUserProfile(user.uid, {
          nombre: formData.nombre,
          rol: formData.rol,
        });
        toast({
          title: "Perfil actualizado",
          description: "El perfil del usuario se ha actualizado correctamente.",
        });
      } else {
        // Crear nuevo perfil
        if (!formData.uid) {
          throw new Error("Se requiere el UID del usuario");
        }
        await createUserProfile(formData.uid, {
          nombre: formData.nombre,
          rol: formData.rol,
        });
        toast({
          title: "Perfil creado",
          description: "El perfil del usuario se ha creado correctamente.",
        });
      }

      setOpen(false);
      onUserSaved();

      // Resetear formulario si es creación
      if (!user) {
        setFormData({
          uid: "",
          nombre: "",
          rol: "user",
        });
      }
    } catch (error) {
      toast({
        title: "Error",
        description:
          error instanceof Error
            ? error.message
            : "Error al guardar el perfil.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  return (
    <Dialog open={open} onOpenChange={setOpen}>
      <DialogTrigger asChild>
        {user ? (
          <Button variant="ghost" size="sm">
            <Edit className="h-4 w-4" />
          </Button>
        ) : (
          <Button
            variant="outline"
            size="sm"
            className="text-black dark:text-gray-400"
          >
            Agregar Perfil Manual
          </Button>
        )}
      </DialogTrigger>
      <DialogContent className="sm:max-w-[500px]">
        <form onSubmit={handleSubmit}>
          <DialogHeader>
            <DialogTitle>
              {user ? "Editar Perfil de Usuario" : "Crear Perfil de Usuario"}
            </DialogTitle>
            <DialogDescription>
              {user
                ? "Modifica el nombre y rol del usuario."
                : "Crea un perfil para un usuario que ya existe en Firebase Authentication. Necesitas el UID del usuario."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid gap-4 py-4">
            {!user && (
              <div className="grid gap-2">
                <Label htmlFor="uid">UID del usuario *</Label>
                <Input
                  id="uid"
                  value={formData.uid}
                  onChange={(e) =>
                    setFormData({ ...formData, uid: e.target.value })
                  }
                  placeholder="UID de Firebase Authentication"
                  required
                />
                <p className="text-xs text-gray-200">
                  El UID se obtiene de Firebase Authentication Console
                </p>
              </div>
            )}

            <div className="grid gap-2">
              <Label htmlFor="nombre">Nombre *</Label>
              <Input
                id="nombre"
                value={formData.nombre}
                onChange={(e) =>
                  setFormData({ ...formData, nombre: e.target.value })
                }
                placeholder="Nombre completo"
                required
              />
            </div>

            <div className="grid gap-2">
              <Label htmlFor="rol">Rol *</Label>
              <Select
                value={formData.rol}
                onValueChange={(value: "admin" | "user") =>
                  setFormData({ ...formData, rol: value })
                }
              >
                <SelectTrigger id="rol" className="text-gray-400">
                  <SelectValue placeholder="Selecciona un rol" />
                </SelectTrigger>
                <SelectContent className="bg-gray-400">
                  {userRole.map((item) => (
                    <SelectItem key={item.value} value={item.value}>
                      {item.label}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>

          <DialogFooter>
            <Button
              type="button"
              variant="outline"
              onClick={() => setOpen(false)}
              disabled={loading}
            >
              Cancelar
            </Button>
            <Button type="submit" disabled={loading} className="text-gray-400">
              {loading ? "Guardando..." : user ? "Actualizar" : "Crear Perfil"}
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  );
}
