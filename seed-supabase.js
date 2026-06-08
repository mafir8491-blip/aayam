require("dotenv").config();
const { supabase } = require("./config/supabase");
const bcrypt = require("bcryptjs");

async function seed() {
  console.log("=========================================");
  console.log("🌱 Seeding Supabase PostgreSQL database...");
  console.log("=========================================");

  try {
    // 1. Seed Admin User
    const passwordHash = await bcrypt.hash("admin123", 10);
    const adminUser = {
      name: "Admin User",
      email: "admin@aayam.org",
      password: passwordHash,
      role: "superadmin",
      isActive: true
    };

    const { error: userError } = await supabase.from("users").upsert(adminUser, { onConflict: "email" });
    if (userError) {
      console.error("❌ Error seeding users:", userError.message);
    } else {
      console.log("👤 Seeded admin user: admin@aayam.org (password: admin123)");
    }

    // Clean other tables to prevent duplicates
    await supabase.from("home_promos").delete().neq("id", "0");
    await supabase.from("home_galleries").delete().neq("id", "0");
    await supabase.from("team_members").delete().neq("id", "0");
    await supabase.from("team_sections").delete().neq("id", "0");
    await supabase.from("events").delete().neq("id", "0");

    // 2. Seed Home Promo Banner
    const promo = {
      title: "AAYAM National Tech Conference 2026",
      label: "Register Now",
      heading: "Empowering innovation and collaboration across disciplines.",
      description: "Join us for three days of keynotes, hackathons, workshops, and networking with industry leaders.",
      link: "/events",
      eventDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
      isActive: true
    };
    const { error: promoError } = await supabase.from("home_promos").insert(promo);
    if (promoError) console.error("❌ Error seeding home promo:", promoError.message);
    else console.log("📢 Seeded home promo banner");

    // 3. Seed Home Gallery
    const gallery = [
      { image: "/uploads/home/1769655815812.jpg", section: "what_we_do" },
      { image: "/uploads/home/1769672671418.png", section: "what_we_do" },
      { image: "/images/aayam_img.jpg", section: "what_we_do" },
      { image: "/uploads/events/1771917348088-aayam_img.jpg", section: "events" },
      { image: "/images/aayam_img.jpg", section: "events" }
    ];
    const { error: galleryError } = await supabase.from("home_galleries").insert(gallery);
    if (galleryError) console.error("❌ Error seeding home galleries:", galleryError.message);
    else console.log("🖼️ Seeded home galleries");

    // 4. Seed Team Sections & Members
    const { data: sections, error: secError } = await supabase.from("team_sections").insert([
      { title: "Faculty Coordinators" },
      { title: "Core Committee" },
      { title: "Technical Team" }
    ]).select();

    if (secError) {
      console.error("❌ Error seeding team sections:", secError.message);
    } else {
      console.log("👥 Seeded team sections");
      const facultySection = sections.find(s => s.title === "Faculty Coordinators");
      const coreSection = sections.find(s => s.title === "Core Committee");
      const techSection = sections.find(s => s.title === "Technical Team");

      const members = [];
      if (facultySection) {
        members.push({
          name: "Dr. Rajesh Sharma",
          position: "Convener & Head of Department",
          image: "/uploads/team/1769673060399.jpg",
          section: facultySection.id
        });
      }
      if (coreSection) {
        members.push(
          {
            name: "Neha Patel",
            position: "President",
            image: "/uploads/team/1769672693910.png",
            section: coreSection.id
          },
          {
            name: "Aarav Shah",
            position: "Secretary",
            image: "/uploads/team/1771916388026.jpeg",
            section: coreSection.id
          }
        );
      }
      if (techSection) {
        members.push({
          name: "Siddharth Verma",
          position: "Lead Developer",
          image: "/uploads/team/1772141879261.jpg",
          section: techSection.id
        });
      }

      if (members.length > 0) {
        const { error: memError } = await supabase.from("team_members").insert(members);
        if (memError) console.error("❌ Error seeding team members:", memError.message);
        else console.log("👥 Seeded team members");
      }
    }

    // 5. Seed Events
    const upcomingEvent = {
      title: "AAYAM Hackathon 2026",
      shortDescription: "The ultimate 36-hour hackathon to build solutions for real-world problems.",
      description: "Welcome to AAYAM Hackathon 2026. Join developers, designers, and innovators from across the country to compete for prizes, network with top companies, and showcase your skills.",
      about: "This event is organized by the AAYAM committee to foster innovation and project development.",
      startDate: new Date(Date.now() + 10 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() + 11 * 24 * 60 * 60 * 1000).toISOString(),
      bannerImage: "/uploads/events/1771917348088-aayam_img.jpg",
      type: "upcoming",
      registrationLink: "/events",
      conductedBy: [{ name: "Technical Committee", email: "tech@aayam.org" }],
      studentCoordinators: [{ name: "Siddharth Verma", email: "siddharth@aayam.org" }],
      contacts: ["Phone: +91 98765 43210", "Email: contact@aayam.org"],
      prizes: ["1st Prize: ₹50,000", "2nd Prize: ₹30,000", "3rd Prize: ₹20,000"]
    };

    const pastEvent = {
      title: "Tech Talk 2025: AI & Future of Web",
      shortDescription: "An insightful talk by industry experts on the future of web development and Artificial Intelligence.",
      description: "Tech Talk 2025 brought together thought leaders and practitioners to discuss AI agents, LLMs, and modern frontend frameworks. It featured interactive Q&A and networking sessions.",
      about: "A successful technical seminar focusing on current and upcoming tech trends.",
      startDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000).toISOString(),
      endDate: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000 + 4 * 60 * 60 * 1000).toISOString(),
      bannerImage: "/images/aayam_img.jpg",
      type: "past",
      conductedBy: [{ name: "Seminar Team", email: "seminars@aayam.org" }],
      contacts: ["Email: info@aayam.org"]
    };

    const { error: evError } = await supabase.from("events").insert([upcomingEvent, pastEvent]);
    if (evError) console.error("❌ Error seeding events:", evError.message);
    else console.log("📅 Seeded events (upcoming and past)");

    console.log("\n✅ Database seeding complete!");
  } catch (error) {
    console.error("❌ Seeding failed:", error.message);
  }
  process.exit(0);
}

seed();
