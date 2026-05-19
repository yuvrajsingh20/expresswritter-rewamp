import { NextResponse } from "next/server";
import servicesData from "@/data/services_data.json";

export async function GET() {
  try {
    const allServices = [];
    
    Object.values(servicesData.individualServices).forEach((categoryServices) => {
      categoryServices.forEach((service) => {
        // Check if this service has variants in sopVariants
        const variants = servicesData.sopVariants?.[service.name];

        if (variants && variants.length > 0) {
          variants.forEach((v, index) => {
             let parsedPrice = 0;
             if (typeof v.price === "string") {
               const numericPart = v.price.replace(/[^0-9.]/g, '');
               if (numericPart) parsedPrice = parseFloat(numericPart);
             } else if (typeof v.price === "number") {
               parsedPrice = v.price;
             }

             allServices.push({
               id: `${service.id || service.name}-var-${index}`,
               name: `${service.name} - ${v.label}`,
               basePrice: parsedPrice
             });
          });
        } else {
          // If no variants, just use the base service
          let parsedPrice = 0;
          if (typeof service.price === "string") {
            const numericPart = service.price.replace(/[^0-9.]/g, '');
            if (numericPart) {
              parsedPrice = parseFloat(numericPart);
            }
          } else if (typeof service.price === "number") {
            parsedPrice = service.price;
          }

          allServices.push({
            id: service.id || service.name,
            name: service.name,
            basePrice: parsedPrice
          });
        }
      });
    });

    return NextResponse.json(allServices);
  } catch (error) {
    console.error("Error fetching services catalog:", error);
    return NextResponse.json({ error: "Failed to fetch services" }, { status: 500 });
  }
}
