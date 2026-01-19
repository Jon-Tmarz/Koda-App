"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { onAuthStateChanged } from "firebase/auth";
import { auth } from "@/lib/firebase";
import { initializeUserProfile } from "@/lib/auth-helpers";
import { Sidebar, SidebarContext } from "@/components/sidebar";
import { Toaster } from "@/components/ui/toaster";
import { cn } from "@/lib/utils";

export default function DashboardLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const router = useRouter();
  const [collapsed, setCollapsed] = useState(true);

  useEffect(() => {
    const unsubscribe = onAuthStateChanged(auth, (user) => {
      if (!user) {
        router.push("/login");
      } else {
        // Inicializar perfil de usuario en Firestore
        initializeUserProfile(user);
      }
    });

    return () => unsubscribe();
  }, [router]);

  return (
    <SidebarContext.Provider value={{ collapsed, setCollapsed }}>
      <div className="relative min-h-screen">
        <Sidebar />
        <main
          className={cn(
            "pt-16 transition-all duration-300",
            collapsed ? "ml-16" : "ml-64"
          )}
        >
          <div className="p-6">{children}</div>
        </main>
        <Toaster />
      </div>
    </SidebarContext.Provider>
  );
}
