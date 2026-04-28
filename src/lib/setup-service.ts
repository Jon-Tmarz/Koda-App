import { collection, getDocs, query, limit, addDoc, serverTimestamp, doc, getDoc } from "firebase/firestore";
import { db } from "./firebase";
import { salariosService } from "./salarios-service";
import { herramientasService } from "./tools-service";
import { updateExchangeRate } from "./divisas-service";
import { DEFAULT_SALARIO_CONFIG, CARGO_MULTIPLICADORES, type Servicio, type ConfiguracionGlobal } from "@/types";
import type { CargoTipo, Lead } from "@/types";
import { serviciosService } from "./servicios-service";

/**
 * Verifica la conexión a Firestore
 */
async function checkFirestoreConnection(): Promise<{
  connected: boolean;
  message: string;
}> {
  try {
    // Intentar leer una colección para verificar conexión
    const testQuery = query(collection(db, "salarios"), limit(1));
    await getDocs(testQuery);
    return {
      connected: true,
      message: "Conexión a Firestore exitosa",
    };
  } catch (error) {
    return {
      connected: false,
      message: error instanceof Error ? error.message : "Error de conexión desconocido",
    };
  }
}

/**
 * Inicializa los datos por defecto en Firestore
 */
async function initializeFirestoreData(): Promise<{
  success: boolean;
  message: string;
  details?: Record<string, string>;
}> {
  const results: Record<string, string> = {};

  try {
    // 1. Verificar/crear configuración de salarios para el año por defecto
    const defaultYear = DEFAULT_SALARIO_CONFIG.año;
    const existingConfig = await salariosService.getConfigByYear(defaultYear);
    if (!existingConfig) {
      await salariosService.saveConfig(DEFAULT_SALARIO_CONFIG);
      results.salarioConfig = `Creada configuración de salarios para ${defaultYear}`;
    } else {
      results.salarioConfig = `Configuración de salarios para ${defaultYear} ya existe`;
    }

    // 2. Verificar/crear cargos
    const existingCargos = await salariosService.getCargos();
    if (existingCargos.length === 0) {
      for (const [nombre, multiplicador] of Object.entries(CARGO_MULTIPLICADORES)) {
        await salariosService.saveCargo({
          nombre: nombre as CargoTipo,
          multiplicador,
          activo: true,
        });
      }
      results.cargos = `Creados ${Object.keys(CARGO_MULTIPLICADORES).length} cargos`;
    } else {
      results.cargos = `Ya existen ${existingCargos.length} cargos`;
    }

    // 3. Crear servicios de ejemplo si no existen
    const existingServicios = await serviciosService.getAll();
    if (existingServicios.length === 0) {
      const serviciosEjemplo: Omit<Servicio, "id" | "createdAt" | "updatedAt">[] = [
        {
          nombre: "Desarrollo Web Frontend",
          descripcion: "Desarrollo de interfaces de usuario con React/Next.js",
          categoria: "Desarrollo",
          cargosSugeridos: ["Tecnólogo", "Profesional"],
          disponible: true,
          tecnologias: ["React", "Next.js", "TypeScript"],
          precio: 0,
        },
        {
          nombre: "Desarrollo Web Backend",
          descripcion: "Desarrollo de APIs y servicios con Node.js",
          categoria: "Desarrollo",
          cargosSugeridos: ["Profesional", "Especialista"],
          disponible: true,
          tecnologias: ["Node.js", "Express", "PostgreSQL"],
          precio: 0,
        },
        {
          nombre: "Diseño UI/UX",
          descripcion: "Diseño de interfaces y experiencia de usuario",
          categoria: "Diseño",
          cargosSugeridos: ["Técnico", "Tecnólogo"],
          disponible: true,
          tecnologias: ["Figma", "Adobe XD"],
          precio: 0,
        },
        {
          nombre: "Desarrollo de Websites Corporativos e Ecommerce",
          descripcion: "Creación de sitios web corporativos y tiendas en línea",
          categoria: "Desarrollo",
          cargosSugeridos: ["Tecnólogo", "Profesional"],
          disponible: true,
          tecnologias: ["WordPress", "Shopify", "WooCommerce"],
          precio: 0,
        },
        {
          nombre: "Gestión de Proyectos",
          descripcion: "Planificación y gestión de proyectos ágiles",
          categoria: "Gestión",
          cargosSugeridos: ["Especialista", "Master"],
          disponible: true,
          tecnologias: ["Jira", "Scrum"],
          precio: 0,
        },
        {
          nombre: "Pruebas y QA",
          descripcion: "Pruebas de software y aseguramiento de calidad",
          categoria: "Calidad",
          cargosSugeridos: ["Técnico", "Tecnólogo"],
          disponible: true,
          tecnologias: ["Jest", "Cypress"],
          precio: 0,
        },
        {
          nombre: "Implementación de Automatizaciones",
          descripcion: "Desarrollo e implementación de automatizaciones de procesos",
          categoria: "Automatización",
          cargosSugeridos: ["Tecnólogo", "Profesional"],
          disponible: true,
          tecnologias: ["n8n", "Zapier", "Playwright"],
          precio: 0,
        },
        {
          nombre: "DevOps",
          descripcion: "Implementación de prácticas DevOps y CI/CD",
          categoria: "DevOps",
          cargosSugeridos: ["Profesional", "Especialista"],
          disponible: true,
          tecnologias: ["Docker", "Kubernetes", "GitHub Actions"],
          precio: 0,
        },
      ];

      for (const servicio of serviciosEjemplo) {
        await serviciosService.create({
          ...servicio,
          tecnologias: servicio.tecnologias.join(', '),
        });
      }
      results.servicios = `Creados ${serviciosEjemplo.length} servicios de ejemplo`;
    } else {
      results.servicios = `Ya existen ${existingServicios.length} servicios`;
    }

    // 3. Inicializar divisa USD/COP
    try {
      await updateExchangeRate();
      results.divisa = "Divisa USD/COP inicializada correctamente";
    } catch (divisaError) {
      console.warn("Error inicializando divisa:", divisaError);
      results.divisa = "Error al inicializar divisa (continuando con otros datos)";
    }

    return {
      success: true,
      message: "Datos inicializados correctamente",
      details: results,
    };
  } catch (error) {
    console.error("Error inicializando datos:", error);
    return {
      success: false,
      message: error instanceof Error ? error.message : "Error desconocido",
      details: results,
    };
  }
}

/**
 * Obtiene la configuración global de la aplicación.
 * @returns {Promise<ConfiguracionGlobal | null>} La configuración global o null si no existe o hay un error.
 */
async function getGlobalConfig(): Promise<ConfiguracionGlobal | null> {
  try {
    const docRef = doc(db, "configuracion", "global");
    const docSnap = await getDoc(docRef);
    if (docSnap.exists()) {
      return docSnap.data() as ConfiguracionGlobal;
    }
    return null;
  } catch (error) {
    console.error("Error obteniendo configuración global:", error);
    // Es preferible retornar null a romper la aplicación si la config no se encuentra.
    return null;
  }
}


export const setupService = {
  checkFirestoreConnection,
  initializeFirestoreData,
  getGlobalConfig,
};