const mongoose = require("mongoose");

const siteSettingsSchema = new mongoose.Schema(
  {
    siteName: {
      type: String,
      required: true,
      default: "Kalbeliya",
    },
    logoUrl: {
      type: String,
      default: "",
    },
    faviconUrl: {
      type: String,
      default: "",
    },
    email: {
      type: String,
      required: true,
    },
    phone: {
      type: String,
      required: true,
    },
    address: {
      type: String,
      required: true,
    },
    aboutUs: {
      type: String,
      default: "",
    },

    //  Social media links
    socialLinks: {
      facebook: { type: String, default: "" },
      instagram: { type: String, default: "" },
      twitter: { type: String, default: "" },
      linkedin: { type: String, default: "" },
      youtube: { type: String, default: "" },
    },

    //  SEO defaults
    defaultMetaTitle: { type: String, default: "" },
    defaultMetaDescription: { type: String, default: "" },
    defaultMetaKeywords: { type: [String], default: [] },

    //  Footer details
    footerText: {
      type: String,
      default: "© 2025 Kalbeliya. All rights reserved. | Crafted with camlenio",
    },
  },
  { timestamps: true, versionKey: false }
);

module.exports = mongoose.model("SiteSettings", siteSettingsSchema);
