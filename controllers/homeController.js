const HomeGallery = require("../models/HomeGallery");
const HomePromo   = require("../models/HomePromo");
const Event       = require("../models/Event");

function parseEventMeta(event) {
  if (!event) return;
  event.category = "Technical"; // default
  event.location = "SVNIT Surat"; // default
  event.customDetails = []; // default
  
  if (event.shortDescription) {
    if (event.shortDescription.startsWith("Category:")) {
      const parts = event.shortDescription.split(" | ");
      const descParts = [];
      parts.forEach(part => {
        if (part.startsWith("Category:")) {
          event.category = part.replace("Category:", "").trim();
        } else if (part.startsWith("Location:")) {
          event.location = part.replace("Location:", "").trim();
        } else if (part.startsWith("Detail:")) {
          const content = part.substring(7).trim(); // remove "Detail:"
          const colonIndex = content.indexOf(":");
          if (colonIndex !== -1) {
            const key = content.substring(0, colonIndex).trim();
            const value = content.substring(colonIndex + 1).trim();
            event.customDetails.push({ key, value });
          } else {
            event.customDetails.push({ key: content, value: "" });
          }
        } else {
          descParts.push(part);
        }
      });
      event.shortDescription = descParts.join(" | ");
    }
  }
}

exports.getHome = async (req, res) => {
  const whatWeDoImages = await HomeGallery.find({ section: "what_we_do" }).limit(4);
  const eventImages    = await HomeGallery.find({ section: "events" }).limit(4);
  const promo          = await HomePromo.findOne({ isActive: true }).sort({ createdAt: -1 }).lean();
  const upcomingEvents = await Event.find({ type: "upcoming" }).sort({ startDate: 1 }).limit(4);

  upcomingEvents.forEach(e => {
    parseEventMeta(e);
    if (e.bannerImage) {
      if (!e.bannerImage.startsWith("http://") && !e.bannerImage.startsWith("https://")) {
        if (!e.bannerImage.startsWith("/")) e.bannerImage = "/" + e.bannerImage;
      }
    }
  });

  res.render("home", { whatWeDoImages, eventImages, promo: promo || null, upcomingEvents });
};

exports.addImage = async (req, res) => {
  try {
    const { section } = req.body;
    if (!req.file || !section) return res.redirect(req.headers.referer || "/");
    const count = await HomeGallery.countDocuments({ section });
    if (count >= 4) return res.redirect(req.headers.referer || "/");
    await HomeGallery.create({ image: req.file.path, section });
    res.redirect(req.headers.referer || "/");
  } catch (err) {
    console.error("Add Image Error:", err.message);
    res.status(500).send("Error uploading image");
  }
};

exports.deleteImage = async (req, res) => {
  try {
    await HomeGallery.findByIdAndDelete(req.params.id);
    res.redirect(req.headers.referer || "/");
  } catch (err) {
    console.error("Delete Image Error:", err.message);
    res.redirect(req.headers.referer || "/");
  }
};

/* ── PROMO CRUD ── */

exports.addPromo = async (req, res) => {
  try {
    const { label, title, heading, description, link, eventDate } = req.body;
    if (!title) return res.redirect(req.headers.referer || "/");
    await HomePromo.updateMany({}, { isActive: false });
    await HomePromo.create({
      label:       label       || "Register Now",
      title,
      heading:     heading     || "",
      description: description || "",
      link:        link        || "",
      eventDate:   eventDate   || null,
      isActive:    true,
    });
    res.redirect(req.headers.referer || "/");
  } catch (err) {
    console.error("Add Promo Error:", err.message);
    res.redirect(req.headers.referer || "/");
  }
};

exports.deletePromo = async (req, res) => {
  try {
    await HomePromo.findByIdAndDelete(req.params.id);
    res.redirect(req.headers.referer || "/");
  } catch (err) {
    console.error("Delete Promo Error:", err.message);
    res.redirect(req.headers.referer || "/");
  }
};

exports.togglePromo = async (req, res) => {
  try {
    const promo = await HomePromo.findById(req.params.id);
    if (promo) { promo.isActive = !promo.isActive; await promo.save(); }
    res.redirect(req.headers.referer || "/");
  } catch (err) {
    console.error("Toggle Promo Error:", err.message);
    res.redirect(req.headers.referer || "/");
  }
};

/* ── GALLERY PAGE ── */
exports.getGalleryPage = async (req, res) => {
  try {
    const Event = require("../models/Event");
    const generalImages = await HomeGallery.find().lean();
    const events = await Event.find({ isPublic: true }).lean();
    
    // Standardize local path urls
    generalImages.forEach(img => {
      if (img.image && !img.image.startsWith("http://") && !img.image.startsWith("https://")) {
        if (!img.image.startsWith("/")) img.image = "/" + img.image;
      }
    });

    const eventImages = [];
    events.forEach(e => {
      if (e.galleryImages && Array.isArray(e.galleryImages)) {
        e.galleryImages.forEach(img => {
          let url = img.url || "";
          if (url && !url.startsWith("http://") && !url.startsWith("https://")) {
            if (!url.startsWith("/")) url = "/" + url;
          }
          eventImages.push({
            url: url,
            title: e.title,
            speakerName: img.speakerName || "",
            detail: img.detail || "",
            eventId: e._id
          });
        });
      }
    });

    res.render("gallery", { generalImages, eventImages });
  } catch (error) {
    console.error("Gallery Page Error:", error.message);
    res.redirect("/");
  }
};