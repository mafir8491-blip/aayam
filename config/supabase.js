const { createClient } = require("@supabase/supabase-js");
const { Pool } = require("pg");
const crypto = require("crypto");
const bcrypt = require("bcryptjs");

const supabaseUrl = process.env.SUPABASE_URL;
const supabaseKey = process.env.SUPABASE_ANON_KEY;
const databaseUrl = process.env.DATABASE_URL;

const isDummy = !supabaseUrl || !supabaseKey || supabaseUrl.includes("dummy-") || supabaseUrl.includes("example.com");

let supabase;
let pool = null;

if (isDummy) {
  console.log("ℹ️ Running in Mock Offline Mode (In-Memory Database)");
  
  const mockDb = {};

  class MockPostgrestBuilder {
    constructor(table, dataList) {
      this.table = table;
      this.dataList = dataList;
      this.filters = [];
      this.sorts = [];
      this.limitVal = null;
    }

    select(selectStr) {
      return this;
    }

    eq(field, value) {
      this.filters.push({ field, op: "eq", value });
      return this;
    }

    neq(field, value) {
      this.filters.push({ field, op: "neq", value });
      return this;
    }

    is(field, value) {
      this.filters.push({ field, op: "is", value });
      return this;
    }

    order(field, { ascending } = { ascending: true }) {
      this.sorts.push({ field, ascending });
      return this;
    }

    limit(num) {
      this.limitVal = num;
      return this;
    }

    async exec() {
      let list = [...this.dataList];
      for (let f of this.filters) {
        list = list.filter(item => {
          if (!item) return false;
          if (f.op === "eq") return item[f.field] === f.value;
          if (f.op === "neq") return item[f.field] !== f.value;
          if (f.op === "is") return item[f.field] === f.value;
          return true;
        });
      }

      for (let s of this.sorts) {
        list.sort((a, b) => {
          const valA = a[s.field];
          const valB = b[s.field];
          if (valA < valB) return s.ascending ? -1 : 1;
          if (valA > valB) return s.ascending ? 1 : -1;
          return 0;
        });
      }

      if (this.limitVal !== null) {
        list = list.slice(0, this.limitVal);
      }

      return { data: list, error: null };
    }

    then(onFulfilled, onRejected) {
      return this.exec().then(onFulfilled, onRejected);
    }
  }

  class MockTable {
    constructor(name, db) {
      this.name = name;
      this.db = db;
      if (!this.db[name]) {
        this.db[name] = [];
      }
    }

    select(selectStr) {
      return new MockPostgrestBuilder(this.name, this.db[this.name]);
    }

    insert(payload) {
      const list = Array.isArray(payload) ? payload : [payload];
      const inserted = [];
      for (let item of list) {
        const doc = { id: crypto.randomUUID(), ...item };
        this.db[this.name].push(doc);
        inserted.push(doc);
      }
      const result = Array.isArray(payload) ? inserted : inserted[0];
      return {
        select: () => ({
          single: async () => ({ data: result, error: null }),
          maybeSingle: async () => ({ data: result, error: null })
        }),
        single: async () => ({ data: result, error: null }),
        maybeSingle: async () => ({ data: result, error: null }),
        then: (onFulfilled) => onFulfilled({ data: result, error: null })
      };
    }

    upsert(payload, options = {}) {
      const list = Array.isArray(payload) ? payload : [payload];
      const conflictField = options.onConflict || "id";
      const inserted = [];
      
      for (let item of list) {
        const idx = this.db[this.name].findIndex(doc => doc[conflictField] === item[conflictField]);
        if (idx !== -1) {
          Object.assign(this.db[this.name][idx], item);
          inserted.push(this.db[this.name][idx]);
        } else {
          const doc = { id: crypto.randomUUID(), ...item };
          this.db[this.name].push(doc);
          inserted.push(doc);
        }
      }
      const result = Array.isArray(payload) ? inserted : inserted[0];
      return {
        select: () => ({
          single: async () => ({ data: result, error: null }),
          maybeSingle: async () => ({ data: result, error: null })
        }),
        single: async () => ({ data: result, error: null }),
        maybeSingle: async () => ({ data: result, error: null }),
        then: (onFulfilled) => onFulfilled({ data: result, error: null })
      };
    }

    update(payload) {
      return {
        eq: (field, value) => {
          const items = this.db[this.name].filter(item => item[field] === value);
          for (let item of items) {
            Object.assign(item, payload);
          }
          const result = items[0] || null;
          return {
            select: () => ({
              single: async () => ({ data: result, error: null }),
              maybeSingle: async () => ({ data: result, error: null })
            }),
            single: async () => ({ data: result, error: null }),
            maybeSingle: async () => ({ data: result, error: null }),
            then: (onFulfilled) => onFulfilled({ data: result, error: null })
          };
        }
      };
    }

    delete() {
      return {
        neq: (field, value) => {
          this.db[this.name] = this.db[this.name].filter(item => item[field] === value);
          return {
            select: () => ({
              maybeSingle: async () => ({ data: null, error: null })
            }),
            maybeSingle: async () => ({ data: null, error: null }),
            then: (onFulfilled) => onFulfilled({ data: null, error: null })
          };
        },
        eq: (field, value) => {
          const index = this.db[this.name].findIndex(item => item[field] === value);
          let deleted = null;
          if (index !== -1) {
            deleted = this.db[this.name].splice(index, 1)[0];
          }
          return {
            select: () => ({
              maybeSingle: async () => ({ data: deleted, error: null })
            }),
            maybeSingle: async () => ({ data: deleted, error: null }),
            then: (onFulfilled) => onFulfilled({ data: deleted, error: null })
          };
        }
      };
    }
  }

  supabase = {
    from(tableName) {
      return new MockTable(tableName, mockDb);
    }
  };

  const seedMockDb = async () => {
    try {
      const passwordHash = await bcrypt.hash("admin123", 10);
      
      // Users
      mockDb.users = [
        {
          id: crypto.randomUUID(),
          name: "Admin User",
          email: "admin@aayam.org",
          password: passwordHash,
          role: "superadmin",
          isActive: true
        }
      ];

      // Home Promos
      mockDb.home_promos = [
        {
          id: crypto.randomUUID(),
          title: "AAYAM National Tech Conference 2026",
          label: "Register Now",
          heading: "Empowering innovation and collaboration across disciplines.",
          description: "Join us for three days of keynotes, hackathons, workshops, and networking with industry leaders.",
          link: "/events",
          eventDate: new Date(Date.now() + 60 * 24 * 60 * 60 * 1000).toISOString(),
          isActive: true
        }
      ];

      // Home Galleries
      mockDb.home_galleries = [
        { id: crypto.randomUUID(), image: "/uploads/home/1769655815812.jpg", section: "what_we_do" },
        { id: crypto.randomUUID(), image: "/uploads/home/1769672671418.png", section: "what_we_do" },
        { id: crypto.randomUUID(), image: "/images/aayam_img.jpg", section: "what_we_do" },
        { id: crypto.randomUUID(), image: "/uploads/events/1771917348088-aayam_img.jpg", section: "events" },
        { id: crypto.randomUUID(), image: "/images/aayam_img.jpg", section: "events" }
      ];

      // Team Sections
      const s1 = crypto.randomUUID();
      const s2 = crypto.randomUUID();
      const s3 = crypto.randomUUID();
      mockDb.team_sections = [
        { id: s1, title: "Faculty Coordinators" },
        { id: s2, title: "Core Committee" },
        { id: s3, title: "Technical Team" }
      ];

      // Team Members
      mockDb.team_members = [
        {
          id: crypto.randomUUID(),
          name: "Dr. Rajesh Sharma",
          position: "Convener & Head of Department",
          image: "/uploads/team/1769673060399.jpg",
          section: s1
        },
        {
          id: crypto.randomUUID(),
          name: "Neha Patel",
          position: "President",
          image: "/uploads/team/1769672693910.png",
          section: s2
        },
        {
          id: crypto.randomUUID(),
          name: "Aarav Shah",
          position: "Secretary",
          image: "/uploads/team/1771916388026.jpeg",
          section: s2
        },
        {
          id: crypto.randomUUID(),
          name: "Siddharth Verma",
          position: "Lead Developer",
          image: "/uploads/team/1772141879261.jpg",
          section: s3
        }
      ];

      // Events
      mockDb.events = [
        {
          id: crypto.randomUUID(),
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
        },
        {
          id: crypto.randomUUID(),
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
        }
      ];

      console.log("🌱 In-Memory Database pre-seeded successfully!");
    } catch (e) {
      console.error("Error seeding mock DB:", e);
    }
  };

  seedMockDb();

} else {
  console.log("🔌 Initializing Real Supabase Connection");
  supabase = createClient(supabaseUrl, supabaseKey);
  
  if (databaseUrl) {
    pool = new Pool({
      connectionString: databaseUrl,
      ssl: { rejectUnauthorized: false }
    });
  }
}

module.exports = {
  supabase,
  pool
};
