"use client";

import { useState, useEffect } from "react";
import { collection, addDoc, updateDoc, deleteDoc, doc, getDocs, Timestamp } from "firebase/firestore";
import { db } from "@/lib/firebase";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table";
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from "@/components/ui/dialog";
import { Plus, Pencil, Trash2, Loader2, UserCheck } from "lucide-react";

interface Colaborador {
  id?: string;
  nombre: string;
  cargo: string;
  email: string;
  telefono?: string;
  fechaIngreso: Date;
  salario: number;
  estado: "Activo" | "Inactivo";
  notas?: string;
}

export default function TalentActivePage() {
  const [colaboradores, setColaboradores] = useState<Colaborador[]>([]);
  const [loading, setLoading] = useState(true);
  const [dialogOpen, setDialogOpen] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [formData, setFormData] = useState<Omit<Colaborador, "id">>({
    nombre: "",
    cargo: "",
    email: "",
    telefono: "",
    fechaIngreso: new Date(),
    salario: 0,
    estado: "Activo",
    notas: "",
  });

  const loadColaboradores = async () => {
    try {
      setLoading(true);
      const querySnapshot = await getDocs(collection(db, "colaboradores"));
      const data = querySnapshot.docs.map((doc) => ({
        id: doc.id,
        ...doc.data(),
        fechaIngreso: doc.data().fechaIngreso?.toDate() || new Date(),
      })) as Colaborador[];
      // Filtrar solo colaboradores activos
      const activos = data.filter((c) => c.estado === "Activo");
      setColaboradores(activos);
    } catch (error) {
      console.error("Error cargando colaboradores:", error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadColaboradores();
  }, []);

  const handleCreate = async () => {
    try {
      await addDoc(collection(db, "colaboradores"), {
        ...formData,
        fechaIngreso: Timestamp.fromDate(formData.fechaIngreso),
      });
      resetForm();
      loadColaboradores();
    } catch (error) {
      console.error("Error creando colaborador:", error);
    }
  };

  const handleUpdate = async () => {
    if (!editingId) return;
    try {
      const docRef = doc(db, "colaboradores", editingId);
      await updateDoc(docRef, {
        ...formData,
        fechaIngreso: Timestamp.fromDate(formData.fechaIngreso),
      });
      resetForm();
      loadColaboradores();
    } catch (error) {
      console.error("Error actualizando colaborador:", error);
    }
  };

  const handleDelete = async (id: string) => {
    if (!confirm("¿Estás seguro de eliminar este colaborador?")) return;
    try {
      await deleteDoc(doc(db, "colaboradores", id));
      loadColaboradores();
    } catch (error) {
      console.error("Error eliminando colaborador:", error);
    }
  };

  const resetForm = () => {
    setFormData({
      nombre: "",
      cargo: "",
      email: "",
      telefono: "",
      fechaIngreso: new Date(),
      salario: 0,
      estado: "Activo",
      notas: "",
    });
    setEditingId(null);
    setDialogOpen(false);
  };

  const openEditDialog = (colaborador: Colaborador) => {
    setFormData({
      nombre: colaborador.nombre,
      cargo: colaborador.cargo,
      email: colaborador.email,
      telefono: colaborador.telefono || "",
      fechaIngreso: colaborador.fechaIngreso,
      salario: colaborador.salario,
      estado: colaborador.estado,
      notas: colaborador.notas || "",
    });
    setEditingId(colaborador.id!);
    setDialogOpen(true);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("es-CO", {
      style: "currency",
      currency: "COP",
      minimumFractionDigits: 0,
    }).format(amount);
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("es-CO", {
      year: "numeric",
      month: "long",
      day: "numeric",
    }).format(date);
  };

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-3xl font-bold tracking-tight flex items-center gap-2">
            <UserCheck className="h-8 w-8" />
            Colaboradores Activos
          </h2>
          <p className="text-muted-foreground">
            Gestión de colaboradores activos en la empresa
          </p>
        </div>
        <Dialog open={dialogOpen} onOpenChange={setDialogOpen}>
          <DialogTrigger asChild>
            <Button onClick={() => resetForm()}>
              <Plus className="mr-2 h-4 w-4" />
              Nuevo Colaborador
            </Button>
          </DialogTrigger>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>
                {editingId ? "Editar Colaborador" : "Nuevo Colaborador"}
              </DialogTitle>
              <DialogDescription>
                {editingId
                  ? "Actualiza los datos del colaborador"
                  : "Agrega un nuevo colaborador activo"}
              </DialogDescription>
            </DialogHeader>
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Nombre Completo</label>
                  <Input
                    value={formData.nombre}
                    onChange={(e) =>
                      setFormData({ ...formData, nombre: e.target.value })
                    }
                    placeholder="Juan Pérez"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Cargo</label>
                  <Input
                    value={formData.cargo}
                    onChange={(e) =>
                      setFormData({ ...formData, cargo: e.target.value })
                    }
                    placeholder="Desarrollador Senior"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Email</label>
                  <Input
                    type="email"
                    value={formData.email}
                    onChange={(e) =>
                      setFormData({ ...formData, email: e.target.value })
                    }
                    placeholder="juan.perez@empresa.com"
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Teléfono</label>
                  <Input
                    value={formData.telefono}
                    onChange={(e) =>
                      setFormData({ ...formData, telefono: e.target.value })
                    }
                    placeholder="+57 300 123 4567"
                  />
                </div>
              </div>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <label className="text-sm font-medium">Fecha de Ingreso</label>
                  <Input
                    type="date"
                    value={formData.fechaIngreso.toISOString().split("T")[0]}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        fechaIngreso: new Date(e.target.value),
                      })
                    }
                  />
                </div>
                <div className="space-y-2">
                  <label className="text-sm font-medium">Salario Mensual</label>
                  <Input
                    type="number"
                    value={formData.salario}
                    onChange={(e) =>
                      setFormData({
                        ...formData,
                        salario: parseFloat(e.target.value),
                      })
                    }
                    placeholder="3000000"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Estado</label>
                <select
                  className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.estado}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      estado: e.target.value as "Activo" | "Inactivo",
                    })
                  }
                >
                  <option value="Activo">Activo</option>
                  <option value="Inactivo">Inactivo</option>
                </select>
              </div>
              <div className="space-y-2">
                <label className="text-sm font-medium">Notas</label>
                <textarea
                  className="flex min-h-[80px] w-full rounded-md border border-input bg-background px-3 py-2 text-sm ring-offset-background placeholder:text-muted-foreground focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring"
                  value={formData.notas}
                  onChange={(e) =>
                    setFormData({ ...formData, notas: e.target.value })
                  }
                  placeholder="Información adicional del colaborador..."
                />
              </div>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={resetForm}>
                Cancelar
              </Button>
              <Button onClick={editingId ? handleUpdate : handleCreate}>
                {editingId ? "Actualizar" : "Crear"}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>
      </div>

      <Card>
        <CardHeader>
          <CardTitle>Lista de Colaboradores</CardTitle>
          <CardDescription>
            {colaboradores.length} colaborador{colaboradores.length !== 1 ? "es" : ""}{" "}
            activo{colaboradores.length !== 1 ? "s" : ""}
          </CardDescription>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center justify-center py-8">
              <Loader2 className="h-8 w-8 animate-spin text-muted-foreground" />
            </div>
          ) : colaboradores.length === 0 ? (
            <div className="text-center py-8 text-muted-foreground">
              No hay colaboradores activos registrados
            </div>
          ) : (
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Nombre</TableHead>
                  <TableHead>Cargo</TableHead>
                  <TableHead>Email</TableHead>
                  <TableHead>Teléfono</TableHead>
                  <TableHead>Fecha Ingreso</TableHead>
                  <TableHead>Salario</TableHead>
                  <TableHead className="text-right">Acciones</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {colaboradores.map((colaborador) => (
                  <TableRow key={colaborador.id}>
                    <TableCell className="font-medium">
                      {colaborador.nombre}
                    </TableCell>
                    <TableCell>{colaborador.cargo}</TableCell>
                    <TableCell>{colaborador.email}</TableCell>
                    <TableCell>{colaborador.telefono || "-"}</TableCell>
                    <TableCell>{formatDate(colaborador.fechaIngreso)}</TableCell>
                    <TableCell>{formatCurrency(colaborador.salario)}</TableCell>
                    <TableCell className="text-right">
                      <div className="flex justify-end gap-2">
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => openEditDialog(colaborador)}
                        >
                          <Pencil className="h-4 w-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="icon"
                          onClick={() => handleDelete(colaborador.id!)}
                        >
                          <Trash2 className="h-4 w-4" />
                        </Button>
                      </div>
                    </TableCell>
                  </TableRow>
                ))}
              </TableBody>
            </Table>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
