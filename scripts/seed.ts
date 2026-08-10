/**
 * scripts/seed.ts
 * Run with: npx tsx scripts/seed.ts
 *
 * Populates the Neon PostgreSQL database with realistic demo data covering
 * all roles, project statuses, application states, and contribution stages.
 *
 * IMPORTANT: Requires DATABASE_URL set in the environment.
 * See DEPLOYMENT.md for instructions.
 */

import { drizzle } from "drizzle-orm/node-postgres"
import { sql } from "drizzle-orm"
import { Pool } from "pg"
import { nanoid } from "nanoid"
import * as schema from "../lib/db/schema"

const pool = new Pool({ connectionString: process.env.DATABASE_URL })
const db = drizzle(pool, { schema })

// ---------------------------------------------------------------------------
// Helpers
// ---------------------------------------------------------------------------

function id() {
  return nanoid()
}

function slugify(title: string, suffix?: string) {
  return (
    title
      .toLowerCase()
      .replace(/[^a-z0-9\s-]/g, "")
      .replace(/\s+/g, "-")
      .replace(/-+/g, "-")
      .slice(0, 70) +
    "-" +
    (suffix ?? nanoid(6))
  )
}

import { hashPassword as betterAuthHashPassword } from "better-auth/crypto"

/** Hash a password exactly as Better Auth does */
async function hashPassword(password: string): Promise<string> {
  return await betterAuthHashPassword(password)
}

// ---------------------------------------------------------------------------
// Seed orchestration
// ---------------------------------------------------------------------------

async function seed() {
  console.log("🌱 Starting seed…\n")

  console.log("🧹 Cleaning existing data…")
  await db.execute(sql`
    TRUNCATE TABLE 
      "audit_logs",
      "notifications",
      "moderation_reviews",
      "contribution_approvals",
      "contributions",
      "project_members",
      "collaboration_applications",
      "project_subscriptions",
      "project_status_history",
      "projects",
      "categories",
      "profiles",
      "verification",
      "account",
      "session",
      "user",
      "university_affiliations"
    CASCADE;
  `)
  console.log("✨ Tables cleaned.\n")

  // -----------------------------------------------------------------------
  // 1. University Affiliations (3 institutions)
  // -----------------------------------------------------------------------
  console.log("📚 Inserting university affiliations…")

  const affNacional = id()
  const affAndes = id()
  const affTechCorp = id()

  await db.insert(schema.universityAffiliations).values([
    {
      id: affNacional,
      name: "Universidad Nacional de Colombia",
      domain: "unal.edu.co",
      type: "university",
    },
    {
      id: affAndes,
      name: "Universidad de los Andes",
      domain: "uniandes.edu.co",
      type: "university",
    },
    {
      id: affTechCorp,
      name: "TechCorp Innovation Lab",
      domain: "techcorp.io",
      type: "company",
    },
  ])

  // -----------------------------------------------------------------------
  // 2. Categories (6 knowledge areas)
  // -----------------------------------------------------------------------
  console.log("🏷️  Inserting categories…")

  const catAI = id()
  const catBio = id()
  const catSust = id()
  const catFintech = id()
  const catEdu = id()
  const catRobot = id()

  await db.insert(schema.categories).values([
    { id: catAI, name: "Inteligencia Artificial", slug: "inteligencia-artificial", description: "Proyectos de aprendizaje automático, NLP, visión computacional y sistemas inteligentes." },
    { id: catBio, name: "Biotecnología", slug: "biotecnologia", description: "Investigación en bioinformática, genomics y biotecnología aplicada." },
    { id: catSust, name: "Sostenibilidad y Medio Ambiente", slug: "sostenibilidad", description: "Proyectos orientados al impacto ambiental, energías renovables y economía circular." },
    { id: catFintech, name: "FinTech e Innovación Financiera", slug: "fintech", description: "Tecnologías financieras, criptomonedas, banca digital y regulación." },
    { id: catEdu, name: "Tecnología Educativa", slug: "educacion", description: "Plataformas de aprendizaje, gamificación y herramientas pedagógicas digitales." },
    { id: catRobot, name: "Robótica y Automatización", slug: "robotica", description: "Robótica industrial, autónoma y sistemas embebidos." },
  ])

  // -----------------------------------------------------------------------
  // 3. Users + Auth Accounts (8 users across all roles)
  // -----------------------------------------------------------------------
  console.log("👥 Inserting users and accounts…")

  const uAdmin    = id()
  const uMod      = id()
  const uLeader1  = id()
  const uLeader2  = id()
  const uCollab1  = id()
  const uCollab2  = id()
  const uStudent  = id()
  const uExpert   = id()

  const users = [
    { id: uAdmin,   name: "Andrés Morales",   email: "admin@unal.edu.co" },
    { id: uMod,     name: "Lucía Herrera",    email: "moderator@unal.edu.co" },
    { id: uLeader1, name: "Carlos Ramírez",   email: "carlos@unal.edu.co" },
    { id: uLeader2, name: "Sofía Vargas",     email: "sofia@uniandes.edu.co" },
    { id: uCollab1, name: "Mateo Torres",     email: "mateo@unal.edu.co" },
    { id: uCollab2, name: "Valentina Cruz",   email: "valentina@uniandes.edu.co" },
    { id: uStudent, name: "Camila Jiménez",   email: "camila@unal.edu.co" },
    { id: uExpert,  name: "Dr. James Pierce", email: "jpierce@techcorp.io" },
  ]

  await db.insert(schema.user).values(
    users.map((u) => ({
      ...u,
      emailVerified: true,
    }))
  )

  // Better Auth account records (credential provider)
  const pwHash = await hashPassword("Demo1234!")
  await db.insert(schema.account).values(
    users.map((u) => ({
      id: id(),
      accountId: u.id,
      providerId: "credential",
      userId: u.id,
      password: pwHash,
    }))
  )

  // -----------------------------------------------------------------------
  // 4. Profiles
  // -----------------------------------------------------------------------
  console.log("🪪  Inserting profiles…")

  await db.insert(schema.profiles).values([
    {
      id: id(), userId: uAdmin,
      role: "admin",
      institutionalEmail: "admin@unal.edu.co",
      bio: "Administrador de la plataforma. Supervisa usuarios y registros.",
      skills: ["gestión", "moderación", "administración"],
      universityAffiliationId: affNacional,
      verificationStatus: "verified",
    },
    {
      id: id(), userId: uMod,
      role: "moderator",
      institutionalEmail: "moderator@unal.edu.co",
      bio: "Moderadora de proyectos interdisciplinarios.",
      skills: ["revisión", "investigación", "metodología"],
      universityAffiliationId: affNacional,
      verificationStatus: "verified",
    },
    {
      id: id(), userId: uLeader1,
      role: "project_leader",
      institutionalEmail: "carlos@unal.edu.co",
      bio: "Ingeniero de sistemas especializado en IA aplicada a salud.",
      skills: ["Python", "Machine Learning", "TensorFlow", "FastAPI"],
      universityAffiliationId: affNacional,
      verificationStatus: "verified",
    },
    {
      id: id(), userId: uLeader2,
      role: "project_leader",
      institutionalEmail: "sofia@uniandes.edu.co",
      bio: "Investigadora en sostenibilidad y diseño de sistemas circulares.",
      skills: ["Sustainability", "Data Analysis", "R", "GIS"],
      universityAffiliationId: affAndes,
      verificationStatus: "verified",
    },
    {
      id: id(), userId: uCollab1,
      role: "collaborator",
      institutionalEmail: "mateo@unal.edu.co",
      bio: "Desarrollador fullstack con interés en proyectos de impacto social.",
      skills: ["React", "Next.js", "Node.js", "PostgreSQL"],
      universityAffiliationId: affNacional,
      verificationStatus: "verified",
    },
    {
      id: id(), userId: uCollab2,
      role: "collaborator",
      institutionalEmail: "valentina@uniandes.edu.co",
      bio: "Diseñadora UX/UI apasionada por la educación digital.",
      skills: ["Figma", "UX Research", "Prototyping", "Accessibility"],
      universityAffiliationId: affAndes,
      verificationStatus: "verified",
    },
    {
      id: id(), userId: uStudent,
      role: "student",
      institutionalEmail: "camila@unal.edu.co",
      bio: "Estudiante de ingeniería buscando experiencia en proyectos reales.",
      skills: ["Python", "Data Science", "Estadística"],
      universityAffiliationId: affNacional,
      verificationStatus: "pending",
    },
    {
      id: id(), userId: uExpert,
      role: "external_expert",
      institutionalEmail: "jpierce@techcorp.io",
      bio: "Ph.D. en Ciencias de la Computación. Experto en sistemas distribuidos.",
      skills: ["Distributed Systems", "Cloud Architecture", "Rust", "Go"],
      universityAffiliationId: affTechCorp,
      verificationStatus: "verified",
    },
  ])

  // -----------------------------------------------------------------------
  // 5. Projects (8 projects in varied statuses)
  // -----------------------------------------------------------------------
  console.log("📁 Inserting projects…")

  const pAI          = id()
  const pSust        = id()
  const pFintech     = id()
  const pEdu         = id()
  const pRobot       = id()
  const pBio         = id()
  const pDraft       = id()
  const pArchived    = id()

  const projects = [
    {
      id: pAI,
      title: "Sistema de Diagnóstico Médico con IA",
      slug: slugify("sistema diagnostico medico ia", "ai01"),
      summary: "Plataforma de IA para apoyar el diagnóstico de enfermedades raras en regiones con acceso limitado a especialistas.",
      description: "Este proyecto busca desarrollar un sistema de apoyo al diagnóstico clínico usando modelos de lenguaje grande (LLM) combinados con datos epidemiológicos colombianos. La herramienta permitirá a médicos generales en zonas rurales consultar patrones de síntomas y obtener sugerencias diagnósticas basadas en evidencia, reduciendo los tiempos de derivación especializada.",
      objectives: "1) Construir un pipeline de datos médicos anonimizados. 2) Entrenar modelos de clasificación de enfermedades. 3) Desarrollar interfaz conversacional para médicos. 4) Realizar pruebas piloto en 3 hospitales rurales.",
      collaborationNeeds: ["Médico clínico para validación", "Especialista en NLP", "Desarrollador backend Python"],
      leaderId: uLeader1,
      categoryId: catAI,
      universityAffiliationId: affNacional,
      status: "published" as const,
      visibility: "public" as const,
      maxMembers: 8,
    },
    {
      id: pSust,
      title: "MapaBosques: Monitoreo Satelital de Deforestación",
      slug: slugify("mapabosques monitoreo satelital deforestacion", "sb02"),
      summary: "Sistema de alerta temprana de deforestación en la Amazonía colombiana usando imágenes satelitales y ML.",
      description: "Aprovechando imágenes de los satélites Sentinel-2 y Landsat, este proyecto entrena modelos de segmentación semántica para detectar cambios en la cobertura boscosa. Las alertas se publican en un mapa interactivo público y se envían a autoridades ambientales y comunidades indígenas guardianas del bosque.",
      objectives: "1) Procesar series de tiempo de imágenes satelitales. 2) Entrenar modelo de cambio de cobertura. 3) Construir dashboard de alertas. 4) API pública de datos.",
      collaborationNeeds: ["Ingeniero GIS", "Experto en sensores remotos", "Desarrollador frontend para mapas"],
      leaderId: uLeader2,
      categoryId: catSust,
      universityAffiliationId: affAndes,
      status: "published" as const,
      visibility: "public" as const,
      maxMembers: 6,
    },
    {
      id: pFintech,
      title: "CréditoPyme: Scoring Alternativo para MiPymes",
      slug: slugify("creditopyme scoring alternativo mipymes", "ft03"),
      summary: "Modelo de scoring crediticio alternativo para micro y pequeñas empresas sin historial bancario formal.",
      description: "Las MiPymes representan más del 90% del tejido empresarial colombiano pero enfrentan barreras de acceso al crédito formal. Este proyecto desarrolla un modelo de scoring alternativo usando datos de transacciones digitales, redes sociales empresariales y comportamiento de proveedores, democratizando el acceso al financiamiento.",
      objectives: "1) Construir dataset de variables alternativas. 2) Entrenar y validar modelo de scoring. 3) Desarrollar API para instituciones financieras. 4) Cumplimiento regulatorio.",
      collaborationNeeds: ["Experto en riesgo crediticio", "Data scientist", "Abogado regulatorio fintech"],
      leaderId: uLeader1,
      categoryId: catFintech,
      universityAffiliationId: affNacional,
      status: "pending_review" as const,
      visibility: "public" as const,
      maxMembers: 5,
    },
    {
      id: pEdu,
      title: "EduAdaptive: Plataforma de Aprendizaje Personalizado",
      slug: slugify("eduadaptive plataforma aprendizaje personalizado", "ed04"),
      summary: "Sistema de tutoría inteligente con rutas de aprendizaje adaptativas para educación STEM en Colombia.",
      description: "EduAdaptive utiliza técnicas de pedagogía mastery-based y sistemas de recomendación para generar rutas de aprendizaje personalizadas en matemáticas, física y programación. La plataforma analiza errores frecuentes, ritmo de aprendizaje y preferencias del estudiante para ajustar el contenido en tiempo real.",
      objectives: "1) Diseñar arquitectura pedagógica adaptativa. 2) Desarrollar motor de recomendación. 3) Crear banco de 500+ ejercicios graduados. 4) Piloto con 200 estudiantes.",
      collaborationNeeds: ["Pedagogo o diseñador instruccional", "Desarrollador React", "Experto en analítica de aprendizaje"],
      leaderId: uLeader2,
      categoryId: catEdu,
      universityAffiliationId: affAndes,
      status: "published" as const,
      visibility: "public" as const,
      maxMembers: 7,
    },
    {
      id: pRobot,
      title: "RoboHarvest: Robot Autónomo para Cosecha de Café",
      slug: slugify("roboharvest robot autonomo cosecha cafe", "rb05"),
      summary: "Robot autónomo de bajo costo para asistir en la cosecha selectiva de café en terrenos irregulares colombianos.",
      description: "Colombia enfrenta escasez de mano de obra para la cosecha cafetera. RoboHarvest es un robot diferencial con visión computacional que identifica y cosecha granos de café en su punto óptimo de madurez, operando en pendientes de hasta 40 grados. Diseñado para ser fabricable por comunidades cafeteras locales usando manufactura digital.",
      objectives: "1) Diseñar mecánica para terrenos inclinados. 2) Visión computacional para clasificación de madurez. 3) Control de navegación autónoma. 4) Prototipo funcional.",
      collaborationNeeds: ["Ingeniero mecatrónico", "Especialista en visión computacional", "Agrónomo cafetero"],
      leaderId: uLeader1,
      categoryId: catRobot,
      universityAffiliationId: affNacional,
      status: "published" as const,
      visibility: "university_only" as const,
      maxMembers: 6,
    },
    {
      id: pBio,
      title: "BioPharma: Identificación de Compuestos Naturales Antivirales",
      slug: slugify("biopharma compuestos naturales antivirales", "bp06"),
      summary: "Screening computacional de compuestos de la biodiversidad colombiana con potencial antiviral.",
      description: "Colombia tiene una de las mayores biodiversidades del mundo. Este proyecto combina bioinformática, química computacional y bases de datos botánicas para identificar compuestos naturales de plantas endémicas colombianas con potencial acción antiviral contra virus de ARN. Los candidatos prometedores serán validados in-vitro.",
      objectives: "1) Construir base de datos de compuestos endémicos. 2) Docking molecular automatizado. 3) Machine learning para predicción de actividad. 4) Validación experimental de top 5 candidatos.",
      collaborationNeeds: ["Bioquímico", "Bioinformático", "Botánico / taxónomo"],
      leaderId: uLeader2,
      categoryId: catBio,
      universityAffiliationId: affAndes,
      status: "published" as const,
      visibility: "public" as const,
      maxMembers: 5,
    },
    {
      id: pDraft,
      title: "AgroSmart: Sensores IoT para Agricultura de Precisión",
      slug: slugify("agrosmart sensores iot agricultura precision", "ag07"),
      summary: "Red de sensores IoT de bajo costo para monitoreo de humedad, temperatura y nutrientes en cultivos de pequeños agricultores.",
      description: "Los pequeños agricultores colombianos no tienen acceso a tecnología de agricultura de precisión por sus costos. AgroSmart diseña sensores de bajo costo basados en ESP32 con conectividad LoRaWAN para monitorear condiciones del suelo y clima, enviando alertas y recomendaciones de riego y fertilización.",
      objectives: "1) Diseñar hardware de sensor. 2) Red LoRaWAN rural. 3) Dashboard de monitoreo. 4) Algoritmos de recomendación.",
      collaborationNeeds: ["Ingeniero electrónico", "Desarrollador embedded", "Agrónomo"],
      leaderId: uLeader1,
      categoryId: catAI,
      universityAffiliationId: affNacional,
      status: "draft" as const,
      visibility: "public" as const,
      maxMembers: 6,
    },
    {
      id: pArchived,
      title: "OpenLegal: Asistente Jurídico para Comunidades Vulnerables",
      slug: slugify("openlegal asistente juridico comunidades", "ol08"),
      summary: "Chatbot legal para orientar a comunidades vulnerables en trámites básicos y derechos fundamentales.",
      description: "Proyecto archivado. Se desarrolló un prototipo funcional de chatbot con procesamiento de lenguaje natural para responder preguntas legales básicas. El proyecto fue archivado tras completar la fase de prototipo por cambio de dirección del equipo.",
      objectives: "1) Corpus legal colombiano. 2) Fine-tuning de modelo. 3) Interfaz conversacional.",
      collaborationNeeds: [],
      leaderId: uLeader2,
      categoryId: catEdu,
      universityAffiliationId: affAndes,
      status: "archived" as const,
      visibility: "public" as const,
      maxMembers: 4,
    },
  ]

  await db.insert(schema.projects).values(projects)

  // -----------------------------------------------------------------------
  // 6. Project Status History
  // -----------------------------------------------------------------------
  console.log("📋 Inserting project status history…")

  await db.insert(schema.projectStatusHistory).values([
    { id: id(), projectId: pAI,      fromStatus: "draft",          toStatus: "pending_review", changedBy: uLeader1, reason: "Listo para revisión." },
    { id: id(), projectId: pAI,      fromStatus: "pending_review", toStatus: "published",      changedBy: uMod,     reason: "Proyecto aprobado. Cumple todos los criterios." },
    { id: id(), projectId: pSust,    fromStatus: "draft",          toStatus: "pending_review", changedBy: uLeader2 },
    { id: id(), projectId: pSust,    fromStatus: "pending_review", toStatus: "published",      changedBy: uMod,     reason: "Aprobado con observaciones menores." },
    { id: id(), projectId: pFintech, fromStatus: "draft",          toStatus: "pending_review", changedBy: uLeader1 },
    { id: id(), projectId: pEdu,     fromStatus: "draft",          toStatus: "pending_review", changedBy: uLeader2 },
    { id: id(), projectId: pEdu,     fromStatus: "pending_review", toStatus: "published",      changedBy: uMod,     reason: "Excelente propuesta pedagógica." },
    { id: id(), projectId: pRobot,   fromStatus: "draft",          toStatus: "pending_review", changedBy: uLeader1 },
    { id: id(), projectId: pRobot,   fromStatus: "pending_review", toStatus: "published",      changedBy: uMod },
    { id: id(), projectId: pBio,     fromStatus: "draft",          toStatus: "pending_review", changedBy: uLeader2 },
    { id: id(), projectId: pBio,     fromStatus: "pending_review", toStatus: "published",      changedBy: uMod },
    { id: id(), projectId: pArchived, fromStatus: "published",     toStatus: "archived",       changedBy: uLeader2, reason: "Cambio de dirección del equipo." },
  ])

  // -----------------------------------------------------------------------
  // 7. Moderation Reviews
  // -----------------------------------------------------------------------
  console.log("🔍 Inserting moderation reviews…")

  await db.insert(schema.moderationReviews).values([
    { id: id(), projectId: pAI,    reviewerId: uMod, decision: "approved", comment: "Impacto social claro, metodología sólida." },
    { id: id(), projectId: pSust,  reviewerId: uMod, decision: "approved", comment: "Problema ambiental relevante con enfoque técnico robusto." },
    { id: id(), projectId: pEdu,   reviewerId: uMod, decision: "approved", comment: "Excelente diseño pedagógico y viabilidad técnica." },
    { id: id(), projectId: pRobot, reviewerId: uMod, decision: "approved", comment: "Propuesta innovadora con impacto en sector cafetero." },
    { id: id(), projectId: pBio,   reviewerId: uMod, decision: "approved", comment: "Alta relevancia científica para la biodiversidad colombiana." },
  ])

  // -----------------------------------------------------------------------
  // 8. Project Members (leaders auto-added + approved collaborators)
  // -----------------------------------------------------------------------
  console.log("👤 Inserting project members…")

  const memAILeader   = id()
  const memAICollab1  = id()
  const memAIExpert   = id()
  const memSustLeader = id()
  const memSustCollab2 = id()
  const memEduLeader  = id()
  const memEduCollab1 = id()
  const memRobotLeader = id()
  const memBioLeader  = id()

  await db.insert(schema.projectMembers).values([
    // AI project
    { id: memAILeader,   projectId: pAI,    userId: uLeader1, roleInProject: "leader",      status: "active" },
    { id: memAICollab1,  projectId: pAI,    userId: uCollab1, roleInProject: "contributor", status: "active" },
    { id: memAIExpert,   projectId: pAI,    userId: uExpert,  roleInProject: "manager",     status: "active" },
    // Sustainability project
    { id: memSustLeader,  projectId: pSust,  userId: uLeader2, roleInProject: "leader",      status: "active" },
    { id: memSustCollab2, projectId: pSust,  userId: uCollab2, roleInProject: "contributor", status: "active" },
    // Education project
    { id: memEduLeader,  projectId: pEdu,   userId: uLeader2, roleInProject: "leader",      status: "active" },
    { id: memEduCollab1, projectId: pEdu,   userId: uCollab1, roleInProject: "contributor", status: "active" },
    // Robotics project
    { id: memRobotLeader, projectId: pRobot, userId: uLeader1, roleInProject: "leader",      status: "active" },
    // Bio project
    { id: memBioLeader,  projectId: pBio,   userId: uLeader2, roleInProject: "leader",      status: "active" },
    // Draft project (only leader so far)
    { id: id(), projectId: pDraft,   userId: uLeader1, roleInProject: "leader", status: "active" },
    // Archived project (only leader)
    { id: id(), projectId: pArchived, userId: uLeader2, roleInProject: "leader", status: "active" },
  ])

  // -----------------------------------------------------------------------
  // 9. Collaboration Applications
  // -----------------------------------------------------------------------
  console.log("📝 Inserting collaboration applications…")

  const appPending1 = id()
  const appPending2 = id()

  await db.insert(schema.collaborationApplications).values([
    // Approved (already a member)
    {
      id: id(),
      projectId: pAI, applicantId: uCollab1,
      message: "Soy desarrollador backend con experiencia en FastAPI y me apasiona la salud digital. Me gustaría contribuir al pipeline de datos y la API del sistema.",
      status: "approved",
      reviewedBy: uLeader1,
      reviewedAt: new Date("2026-07-10"),
    },
    {
      id: id(),
      projectId: pAI, applicantId: uExpert,
      message: "Como experto en sistemas distribuidos, puedo aportar en la arquitectura de despliegue del modelo y la API de inferencia.",
      status: "approved",
      reviewedBy: uLeader1,
      reviewedAt: new Date("2026-07-12"),
    },
    {
      id: id(),
      projectId: pSust, applicantId: uCollab2,
      message: "Soy diseñadora UX y quiero contribuir a la interfaz del mapa interactivo, haciendo que sea accesible para comunidades locales.",
      status: "approved",
      reviewedBy: uLeader2,
      reviewedAt: new Date("2026-07-15"),
    },
    {
      id: id(),
      projectId: pEdu, applicantId: uCollab1,
      message: "Tengo experiencia en React y Next.js y me interesa mucho la educación adaptativa. Puedo liderar el desarrollo del frontend.",
      status: "approved",
      reviewedBy: uLeader2,
      reviewedAt: new Date("2026-07-20"),
    },
    // Rejected
    {
      id: id(),
      projectId: pAI, applicantId: uStudent,
      message: "Soy estudiante de ingeniería y quiero aprender sobre IA médica.",
      status: "rejected",
      reviewedBy: uLeader1,
      reviewedAt: new Date("2026-07-11"),
    },
    // Pending
    {
      id: appPending1,
      projectId: pRobot, applicantId: uCollab2,
      message: "Como diseñadora UX puedo contribuir a la interfaz de control y monitoreo del robot, mejorando la experiencia de los operadores.",
      status: "pending",
    },
    {
      id: appPending2,
      projectId: pBio, applicantId: uStudent,
      message: "Estoy cursando biología y me gustaría aprender bioinformática aplicada colaborando en este proyecto.",
      status: "pending",
    },
    // Withdrawn
    {
      id: id(),
      projectId: pFintech, applicantId: uCollab1,
      message: "Me interesa el scoring alternativo, tengo experiencia en modelos de crédito.",
      status: "withdrawn",
      reviewedAt: new Date("2026-07-25"),
    },
  ])

  // -----------------------------------------------------------------------
  // 10. Contributions (varied types and statuses)
  // -----------------------------------------------------------------------
  console.log("💡 Inserting contributions…")

  const contAI1  = id()
  const contAI2  = id()
  const contSust = id()
  const contEdu  = id()
  const contPend = id()

  await db.insert(schema.contributions).values([
    // AI project – approved milestone
    {
      id: contAI1,
      projectId: pAI, memberId: memAICollab1,
      title: "Pipeline de Ingesta y Limpieza de Datos Clínicos",
      description: "Se implementó un pipeline ETL completo para procesar registros médicos en formato HL7 FHIR. Incluye anonimización de datos de pacientes, normalización de códigos CIE-10 y validación de integridad referencial. El pipeline procesa ~10K registros por hora.",
      type: "milestone",
      status: "approved",
      contentUrl: "https://github.com/demo/ai-health/tree/main/pipeline",
    },
    // AI project – approved update
    {
      id: contAI2,
      projectId: pAI, memberId: memAIExpert,
      title: "Arquitectura de Despliegue en AWS con Auto-scaling",
      description: "Diseño e implementación de la arquitectura de despliegue del modelo de inferencia en AWS ECS con auto-scaling basado en latencia. Latencia promedio: 340ms. Disponibilidad: 99.9%.",
      type: "resource",
      status: "approved",
      contentUrl: "https://docs.demo.com/ai-health/architecture",
    },
    // Sustainability project – approved update
    {
      id: contSust,
      projectId: pSust, memberId: memSustCollab2,
      title: "Diseño del Dashboard de Alertas de Deforestación",
      description: "Wireframes y prototipo interactivo del dashboard de monitoreo. Incluye mapa en tiempo real, panel de alertas prioritizadas y exportación de reportes. Validado con 2 sesiones de usabilidad con guardabosques.",
      type: "milestone",
      status: "approved",
      contentUrl: "https://figma.com/demo/mapabosques-dashboard",
    },
    // Education project – approved report
    {
      id: contEdu,
      projectId: pEdu, memberId: memEduCollab1,
      title: "Implementación del Motor de Recomendación de Ejercicios",
      description: "Motor de recomendación basado en filtrado colaborativo y árboles de conocimiento. Mejora del 23% en tasa de completitud de ejercicios comparado con rutas lineales. Tests de A/B con 50 estudiantes piloto.",
      type: "report",
      status: "approved",
    },
    // Pending contribution
    {
      id: contPend,
      projectId: pAI, memberId: memAICollab1,
      title: "Modelo v2: Fine-tuning con Datos Colombianos",
      description: "Segunda versión del modelo diagnóstico fine-tuneado con 15K registros clínicos colombianos adicionales. Mejora del 12% en F1-score para enfermedades tropicales. Pendiente de revisión por el equipo médico.",
      type: "update",
      status: "submitted",
    },
  ])

  // -----------------------------------------------------------------------
  // 11. Contribution Approvals
  // -----------------------------------------------------------------------
  console.log("✅ Inserting contribution approvals…")

  await db.insert(schema.contributionApprovals).values([
    { id: id(), contributionId: contAI1,  reviewerId: uLeader1, decision: "approved", comment: "Excelente trabajo. Pipeline robusto y bien documentado." },
    { id: id(), contributionId: contAI2,  reviewerId: uLeader1, decision: "approved", comment: "Arquitectura sólida con buenas métricas de despliegue." },
    { id: id(), contributionId: contSust, reviewerId: uLeader2, decision: "approved", comment: "Diseño centrado en el usuario. Sesiones de usabilidad bien ejecutadas." },
    { id: id(), contributionId: contEdu,  reviewerId: uLeader2, decision: "approved", comment: "Resultados cuantificados y metodología A/B bien aplicada." },
  ])

  // -----------------------------------------------------------------------
  // 12. Project Subscriptions (follows)
  // -----------------------------------------------------------------------
  console.log("🔔 Inserting project subscriptions…")

  await db.insert(schema.projectSubscriptions).values([
    { id: id(), projectId: pAI,    userId: uStudent  },
    { id: id(), projectId: pAI,    userId: uCollab2  },
    { id: id(), projectId: pSust,  userId: uStudent  },
    { id: id(), projectId: pSust,  userId: uCollab1  },
    { id: id(), projectId: pEdu,   userId: uStudent  },
    { id: id(), projectId: pRobot, userId: uStudent  },
    { id: id(), projectId: pBio,   userId: uCollab2  },
    { id: id(), projectId: pFintech, userId: uExpert },
  ])

  // -----------------------------------------------------------------------
  // 13. Notifications
  // -----------------------------------------------------------------------
  console.log("🔔 Inserting notifications…")

  await db.insert(schema.notifications).values([
    {
      id: id(), userId: uLeader1,
      type: "application_received",
      title: "Nueva solicitud de colaboración",
      message: `Valentina Cruz solicitó unirse a "RoboHarvest"`,
      link: `/dashboard/projects/${pRobot}`,
      isRead: false,
    },
    {
      id: id(), userId: uLeader2,
      type: "application_received",
      title: "Nueva solicitud de colaboración",
      message: `Camila Jiménez solicitó unirse a "BioPharma"`,
      link: `/dashboard/projects/${pBio}`,
      isRead: false,
    },
    {
      id: id(), userId: uLeader1,
      type: "contribution_submitted",
      title: "Nueva contribución enviada",
      message: `Mateo Torres envió "Modelo v2: Fine-tuning con Datos Colombianos" para revisión`,
      link: `/dashboard/projects/${pAI}`,
      isRead: false,
    },
    {
      id: id(), userId: uCollab1,
      type: "application_approved",
      title: "¡Solicitud aprobada!",
      message: `Tu solicitud para unirte a "Sistema de Diagnóstico Médico con IA" fue aprobada`,
      link: `/projects/${projects[0].slug}`,
      isRead: true,
    },
    {
      id: id(), userId: uCollab2,
      type: "application_approved",
      title: "¡Solicitud aprobada!",
      message: `Tu solicitud para unirte a "MapaBosques" fue aprobada`,
      link: `/projects/${projects[1].slug}`,
      isRead: true,
    },
    {
      id: id(), userId: uStudent,
      type: "application_rejected",
      title: "Solicitud no aprobada",
      message: `Tu solicitud para "Sistema de Diagnóstico Médico con IA" no fue aprobada en esta ocasión`,
      link: `/projects/${projects[0].slug}`,
      isRead: false,
    },
    {
      id: id(), userId: uLeader1,
      type: "moderation_approved",
      title: "Proyecto publicado",
      message: `"Sistema de Diagnóstico Médico con IA" fue aprobado y publicado`,
      link: `/projects/${projects[0].slug}`,
      isRead: true,
    },
  ])

  // -----------------------------------------------------------------------
  // 14. Audit Logs
  // -----------------------------------------------------------------------
  console.log("📒 Inserting audit logs…")

  await db.insert(schema.auditLogs).values([
    { id: id(), actorId: uLeader1, action: "project.created",             entityType: "project", entityId: pAI,      metadata: { title: "Sistema de Diagnóstico Médico con IA" } },
    { id: id(), actorId: uLeader1, action: "project.submitted_for_review", entityType: "project", entityId: pAI },
    { id: id(), actorId: uMod,     action: "project.approved",            entityType: "project", entityId: pAI,      metadata: { comment: "Impacto social claro, metodología sólida." } },
    { id: id(), actorId: uLeader2, action: "project.created",             entityType: "project", entityId: pSust,    metadata: { title: "MapaBosques" } },
    { id: id(), actorId: uMod,     action: "project.approved",            entityType: "project", entityId: pSust,    metadata: { comment: "Aprobado con observaciones menores." } },
    { id: id(), actorId: uCollab1, action: "application.created",         entityType: "collaboration_application", entityId: appPending1 },
    { id: id(), actorId: uLeader1, action: "application.approved",        entityType: "collaboration_application", entityId: appPending1 },
    { id: id(), actorId: uCollab1, action: "contribution.submitted",      entityType: "contribution", entityId: contAI1 },
    { id: id(), actorId: uLeader1, action: "contribution.approved",       entityType: "contribution", entityId: contAI1 },
    { id: id(), actorId: uAdmin,   action: "profile.role_updated",        entityType: "profile",   entityId: uMod,    metadata: { role: "moderator" } },
    { id: id(), actorId: uAdmin,   action: "profile.verification_updated", entityType: "profile",  entityId: uExpert, metadata: { status: "verified" } },
  ])

  // -----------------------------------------------------------------------
  console.log("\n✅ Seed completado exitosamente!")
  console.log("\n📊 Resumen de datos insertados:")
  console.log("   - 3 afiliaciones universitarias/empresariales")
  console.log("   - 6 categorías de conocimiento")
  console.log("   - 8 usuarios (admin, moderator, 2 leaders, 2 collaborators, 1 student, 1 expert)")
  console.log("   - 8 proyectos (2 published, 1 pending_review, 1 draft, 1 archived, 3 published)")
  console.log("   - 11 miembros de proyectos")
  console.log("   - 8 solicitudes de colaboración (4 approved, 1 rejected, 2 pending, 1 withdrawn)")
  console.log("   - 5 contribuciones (4 approved, 1 submitted)")
  console.log("   - 4 aprobaciones de contribuciones")
  console.log("   - 8 suscripciones a proyectos")
  console.log("   - 7 notificaciones")
  console.log("   - 11 registros de auditoría")
  console.log("\n🔑 Credenciales de acceso demo:")
  console.log("   admin@unal.edu.co     → rol: admin")
  console.log("   moderator@unal.edu.co → rol: moderator")
  console.log("   carlos@unal.edu.co    → rol: project_leader")
  console.log("   sofia@uniandes.edu.co → rol: project_leader")
  console.log("   mateo@unal.edu.co     → rol: collaborator")
  console.log("   valentina@uniandes.edu.co → rol: collaborator")
  console.log("   camila@unal.edu.co    → rol: student")
  console.log("   jpierce@techcorp.io   → rol: external_expert")
  console.log("\n✅ Contraseñas generadas con hashes reales compatibles con Better Auth.")
  console.log("   Puedes iniciar sesión con la contraseña 'Demo1234!' para las cuentas creadas.")

  await pool.end()
}

seed().catch((err) => {
  console.error("❌ Error durante el seed:", err)
  process.exit(1)
})
