import { NextResponse } from "next/server";
import { prisma } from "@/lib/prisma";
import { getServerSession } from "next-auth/next";
import { authOptions } from "@/lib/auth";
import fs from "fs";
import path from "path";

export const dynamic = "force-dynamic";

export const INITIAL_SERVICES = [
  { slug: 'cv-urgent',         category: 'Academic', icon: '🎓', name: 'Statement of Purpose: Academic', tagline: 'Admission-ready Statement of Purpose', variantsCount: 6, addonsCount: 3, isActive: true,  ordersCount: 312, revenue: '₹14.2L', priceMin: 4499,  priceMax: 7999, description: 'Crafted by PhD-level writers with admissions expertise. Includes thorough research on your target program, narrative arc, and 2 free revisions.', features: ["24 hours turnaround", "ATS friendly", "Expert design"] },
  { slug: 'sop-visa',          category: 'Visa',     icon: '🛂', name: 'Statement of Purpose: Visa',     tagline: 'Country-specific Visa SOPs & Appeals',   variantsCount: 5, addonsCount: 2, isActive: true,  ordersCount: 198, revenue: '₹9.4L',  priceMin: 3999,  priceMax: 7500, description: 'Visa-focused statement of purpose for high success rate. Includes country-specific justifications and addressing previous refusals.', features: ["Persuasive formatting", "Visa officer focus", "Country specific"] },
  { slug: 'loi-visit',         category: 'Visa',     icon: '✉️', name: 'Letter of Invitation ( Visit Visa)', tagline: 'Professional travel invite letter',            variantsCount: 4, addonsCount: 0, isActive: true,  ordersCount: 89,  revenue: '₹1.1L',  priceMin: 699,   priceMax: 799,  description: 'Formal invitation letter to invite family or friends for visitor visa applications. Meets all embassy formatting standards.', features: ["Clear structure", "Required details included", "Formal tone"] },
  { slug: 'ps-academic',       category: 'Academic', icon: '📝', name: 'Personal Statement',             tagline: 'UK, EU & global admission essays',       variantsCount: 5, addonsCount: 2, isActive: true,  ordersCount: 142, revenue: '₹4.1L',  priceMin: 2499,  priceMax: 2599, description: 'Highlight your personal journey and academic achievements. Personalized narrative focusing on impactful storytelling.', features: ["Personalized narrative", "Impactful storytelling", "2 free revisions"] },
  { slug: 'lor-academic',      category: 'Academic', icon: '📜', name: 'Academic Letter of Recommendation(LOR)', tagline: 'Faculty academic recommendations',         variantsCount: 5, addonsCount: 1, isActive: true,  ordersCount: 245, revenue: '₹3.8L',  priceMin: 1099,  priceMax: 1999, description: 'Highly personalized academic letters written from the perspective of faculty supervisors highlighting academic excellence.', features: ["Detailed examples", "Professional tone", "Faculty aligned"] },
  { slug: 'lor-job',           category: 'Career',   icon: '💼', name: 'Letter of Recommendation (for Job)', tagline: 'Professional endorsements for career moves',   variantsCount: 3, addonsCount: 0, isActive: true,  ordersCount: 76,  revenue: '₹0.8L',  priceMin: 499,   priceMax: 1499, description: 'Professional endorsements from managers or supervisors focused on your specific job impact, work ethic, and leadership skills.', features: ["Action-oriented", "Skill highlighting", "Impact focused"] },
  { slug: 'lor-scholarship',   category: 'Academic', icon: '📜', name: 'Letter of Recommendation (for Scholarship)', tagline: 'Scholarship endorsements to secure funding', variantsCount: 5, addonsCount: 1, isActive: true,  ordersCount: 62,  revenue: '₹0.9L',  priceMin: 1299,  priceMax: 1999, description: 'Strong reference letters tailored to highlight achievement, academic honors, and justification for university or state funding.', features: ["Achievement focus", "Financial need context", "High success rate"] },
  { slug: 'resume-admission',  category: 'Academic', icon: '🎓', name: 'Admission Focussed Resume',             tagline: 'Academic CV optimized for admissions',   variantsCount: 5, addonsCount: 0, isActive: true,  ordersCount: 120, revenue: '₹1.8L',  priceMin: 999,   priceMax: 3999, description: 'Showcasing academic achievements, research publications, projects, and educational milestones for elite university applications.', features: ["Academic formatting", "Research focus", "ATS friendly"] },
  { slug: 'resume-job',        category: 'Career',   icon: '💼', name: 'Job Focussed Resume',                   tagline: 'ATS-optimized resumes for corporate roles', variantsCount: 3, addonsCount: 1, isActive: true,  ordersCount: 521, revenue: '₹11.6L', priceMin: 599,   priceMax: 1699, description: 'Corporate-standard resumes designed to pass through ATS filters and catch the eye of recruiters.', features: ["ATS optimized", "Keyword rich", "Clean layout"] },
  { slug: 'resume-research',   category: 'Academic', icon: '🧬', name: 'Research Focussed Resume',              tagline: 'CV optimized for research & lab positions', variantsCount: 1, addonsCount: 0, isActive: true,  ordersCount: 45,  revenue: '₹0.5L',  priceMin: 1199,  priceMax: 1199, description: 'Resumes highlighting publications, journal articles, lab techniques, and academic research collaborations.', features: ["Publication formatting", "Lab skills", "Research aligned"] },
  { slug: 'resume-experienced', category: 'Career',   icon: '💼', name: 'Experienced Corporate Resume',          tagline: 'Mid-level to senior management resumes',   variantsCount: 1, addonsCount: 0, isActive: true,  ordersCount: 110, revenue: '₹2.1L',  priceMin: 1199,  priceMax: 1199, description: 'For experienced professionals targeting mid-to-senior corporate management roles. Quantifies achievements and leadership experience.', features: ["Leadership focus", "Quantifiable impacts", "Tailored to industry"] },
  { slug: 'resume-elite',      category: 'Career',   icon: '💎', name: 'Elite Resume',                          tagline: 'Executive level presentation CV',        variantsCount: 1, addonsCount: 0, isActive: true,  ordersCount: 95,  revenue: '₹2.8L',  priceMin: 1999,  priceMax: 1999, description: 'Executive-grade CV designed for directors, VPs, and C-level candidates. Highlights board presentation and strategy.', features: ["Executive summary", "Board-level presentation", "Highly custom"] },
  { slug: 'essay-academic',    category: 'Academic', icon: '📝', name: 'Academic Essays',                       tagline: 'High-quality, customized academic essay research', variantsCount: 1, addonsCount: 1, isActive: true,  ordersCount: 204, revenue: '₹5.3L',  priceMin: 2599,  priceMax: 2599, description: 'Well-researched academic essays for university coursework. Includes full bibliography, proper formatting, and Plagiarism-Free guarantee.', features: ["Proper citations", "Original content", "Plagiarism free"] },
  { slug: 'visa-b1b2',         category: 'Visa',     icon: '🛂', name: 'B1B2 Visa',                             tagline: 'Complete tourist and business visitor visa assistance', variantsCount: 1, addonsCount: 0, isActive: true,  ordersCount: 38,  revenue: '₹9.5L',  priceMin: 25000, priceMax: 25000, description: 'Complete B1/B2 Visitor Visa assistance package including DS-160 processing, documentation consulting, slot booking support, and mock preparation.', features: ["DS 160 Fill up", "Documents consulting", "Interview Strategy & Mock Prep", "Slot Booking Support"] },
  { slug: 'essay-scholarship', category: 'Academic', icon: '🎓', name: 'Scholarship Essay [1]',                  tagline: 'Compelling essays for university funding', variantsCount: 2, addonsCount: 0, isActive: true,  ordersCount: 88,  revenue: '₹1.7L',  priceMin: 1999,  priceMax: 1999, description: 'Compelling essays designed to showcase your academic achievements, leadership potential, and financial need to secure university scholarships.', features: ["Custom written", "Persuasive content", "Academic focus"] },
  { slug: 'sop-gmat-waiver',   category: 'Academic', icon: '📝', name: 'GMAT/GRE Waiver Letter',                tagline: 'Professional GMAT/GRE waiver applications', variantsCount: 1, addonsCount: 0, isActive: true,  ordersCount: 112, revenue: '₹1.6L',  priceMin: 1499,  priceMax: 1499, description: 'Professional application letters requesting GMAT/GRE test waivers for university admissions by highlighting your professional experience and academic strengths.', features: ["Email Template / Essay", "ATS friendly", "Expert design"] },
  { slug: 'sop-app-fee-waiver', category: 'Academic', icon: '📜', name: 'Application Fee Waiver Letter',         tagline: 'Request application fee waivers professionally', variantsCount: 1, addonsCount: 0, isActive: true,  ordersCount: 134, revenue: '₹2.0L',  priceMin: 1499,  priceMax: 1499, description: 'Request application fee waivers professionally from target universities. Highly persuasive letter stating academic highlights and eligibility.', features: ["Email Template / Essay", "ATS friendly", "Expert design"] },
  { slug: 'resume-linkedin',   category: 'Career',   icon: '💎', name: 'Linkedin Profile Management',           tagline: 'Expert Linkedin profile optimization',   variantsCount: 1, addonsCount: 0, isActive: true,  ordersCount: 268, revenue: '₹2.6L',  priceMin: 999,   priceMax: 1999, description: 'Full Linkedin profile makeover and keyword optimization to maximize your recruiter visibility and highlight career impact.', features: ["Profile makeover", "ATS friendly", "Recruiter search optimized"] },
  { slug: 'resume-email',      category: 'Career',   icon: '📧', name: 'Email Templates',                       tagline: 'Professional outreach & networking templates', variantsCount: 1, addonsCount: 0, isActive: true,  ordersCount: 156, revenue: '₹0.6L',  priceMin: 399,   priceMax: 399,  description: 'Corporate standard, ready-to-use email outreach templates for professional networking, cold outreach, and job applications.', features: ["Ready-to-use templates", "Corporate standard", "Multiple scenarios"] },
  { slug: 'essay-media',       category: 'Content',  icon: '✍️', name: 'Media Article Write up',                tagline: 'Publish-ready articles for media & news', variantsCount: 1, addonsCount: 0, isActive: true,  ordersCount: 52,  revenue: '₹2.6L',  priceMin: 4999,  priceMax: 4999, description: 'Professional write-ups and editorial columns for media, news, and digital magazines. Expertly researched and ready for publication.', features: ["Expert research", "Publish-ready", "SEO optimized"] }
];

export async function GET() {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    // 1. Query all services from the DB
    const services = await prisma.service.findMany({
      orderBy: { createdAt: "desc" },
    });

    // 2. Load catalog configuration dynamically (prefer database SystemConfig, fallback to disk)
    let servicesData = { sopVariants: {}, serviceAddons: {} };
    try {
      const config = await prisma.systemConfig.findUnique({
        where: { key: "SERVICES_CATALOG_DATA" }
      });
      if (config && config.value) {
        servicesData = typeof config.value === "string" ? JSON.parse(config.value) : config.value;
      } else {
        // Fallback to disk and seed
        const jsonPath = path.join(process.cwd(), "data", "services_data.json");
        if (fs.existsSync(jsonPath)) {
          servicesData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
          await prisma.systemConfig.create({
            data: {
              key: "SERVICES_CATALOG_DATA",
              value: servicesData
            }
          });
        }
      }
    } catch (dbErr) {
      console.warn("[Catalog Data GET Admin] Database SystemConfig check failed, falling back to disk:", dbErr);
      const jsonPath = path.join(process.cwd(), "data", "services_data.json");
      if (fs.existsSync(jsonPath)) {
        servicesData = JSON.parse(fs.readFileSync(jsonPath, "utf8"));
      }
    }

    const servicesWithVariants = services.map(s => {
      const variants = servicesData.sopVariants?.[s.name] || [];
      const serviceAddons = servicesData.serviceAddons?.[s.name] || { addonPrice: 499, customisationPrice: 799 };
      
      return {
        ...s,
        addonPrice: serviceAddons.addonPrice ?? 499,
        customisationPrice: serviceAddons.customisationPrice ?? 799,
        variants: variants.map(v => ({
          label: v.label,
          words: v.words || v.wordCount || "1000 words",
          price: v.price || s.priceMin || 999,
          delivery: v.delivery || "5-7 days",
          fastTrackPrice: v.fastTrackPrice || 0,
          fastTrackDelivery: v.fastTrackDelivery || "24-48 hours",
          addonPrice: null,
          customisation: "According to Requirements"
        }))
      };
    });

    return NextResponse.json(servicesWithVariants);
  } catch (error) {
    console.error("[API/Services] GET Error:", error);
    return NextResponse.json({ error: "Failed to fetch services", details: error.message }, { status: 500 });
  }
}

export async function POST(req) {
  const session = await getServerSession(authOptions);
  if (!session || session.user.role !== "ADMIN") {
    return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
  }

  try {
    const data = await req.json();
    const service = await prisma.service.create({
      data: {
        slug: data.slug || data.id,
        name: data.name,
        description: data.description || "",
        features: data.features || [],
        basePrice: parseFloat(data.priceMin || 0),
        isActive: data.isActive !== undefined ? data.isActive : true,
        tagline: data.tagline || "",
        category: data.category || data.cat || "Academic",
        icon: data.icon || "✨",
        priceMin: parseFloat(data.priceMin || 0),
        priceMax: parseFloat(data.priceMax || 0),
        variantsCount: parseInt(data.variantsCount || data.variants || 1),
        addonsCount: parseInt(data.addonsCount || data.addons || 0),
        ordersCount: parseInt(data.ordersCount || data.orders || 0),
        revenue: data.revenue || "₹0",
      }
    });

    try {
      // Log the action
      await prisma.auditLog.create({
        data: {
          userId: session.user?.id && session.user.id.length === 24 ? session.user.id : null,
          userName: session.user?.name || "Admin",
          action: `Created Service: ${data.name} (${data.slug || data.id})`,
          ipAddress: req.headers.get("x-forwarded-for") || "unknown",
        }
      });
    } catch (auditError) {
      console.warn("[API/Services] AuditLog could not be created:", auditError);
    }

    return NextResponse.json(service);
  } catch (error) {
    console.error("[API/Services] POST Error:", error);
    return NextResponse.json({ error: "Failed to create service", details: error.message }, { status: 500 });
  }
}
