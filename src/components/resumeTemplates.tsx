import type { ReactElement } from "react";
import { Document, Page, View, Text, StyleSheet, Svg, Path, Rect, Circle, pdf } from "@react-pdf/renderer";
import { ResumeData } from "../types";
import { TemplateId, DEFAULT_TEMPLATE } from "./resumeTemplateMeta";

// ---------------------------------------------------------------------------
// Shared palette + helpers used across every template.
// ---------------------------------------------------------------------------
const C = {
  slate900: "#0f172a",
  slate800: "#1e293b",
  slate700: "#334155",
  slate600: "#475569",
  slate500: "#64748b",
  slate400: "#94a3b8",
  slate300: "#cbd5e1",
  slate200: "#e2e8f0",
  slate100: "#f1f5f9",
  slate50: "#f8fafc",
  indigo600: "#4f46e5",
  teal700: "#0f766e",
  white: "#ffffff",
};

// Mirror ResumePreview's splitting: turn a run-on description into bullets when
// it clearly holds multiple statements; otherwise treat it as one paragraph.
// Also splits on newlines and strips any leading bullet glyphs the source text
// may already contain, so we never emit an empty or bullet-only point.
function toPoints(description: string | string[]): string[] {
  const raw = Array.isArray(description)
    ? description.map((s) => String(s))
    : description.split(/(?:\. |; |\.[\n\r]|;[\n\r]|\.$|;$|[\n\r]+)/g);
  return raw
    .map((p) => p.replace(/^[\s•\-*·]+/, "").trim())
    .filter((p) => p.length > 0);
}

type IconName = "mail" | "phone" | "map" | "globe";

function ContactIcon({ name, color, size = 9 }: { name: IconName; color: string; size?: number }) {
  const common = { stroke: color, strokeWidth: 2, fill: "none" as const };
  const round = { strokeLinecap: "round" as const, strokeLinejoin: "round" as const };
  return (
    <Svg width={size} height={size} viewBox="0 0 24 24">
      {name === "mail" && (
        <>
          <Rect x="2" y="4" width="20" height="16" rx="2" {...common} />
          <Path d="m22 7-8.97 5.7a1.94 1.94 0 0 1-2.06 0L2 7" {...common} {...round} />
        </>
      )}
      {name === "phone" && (
        <Path
          d="M22 16.92v3a2 2 0 0 1-2.18 2 19.79 19.79 0 0 1-8.63-3.07 19.5 19.5 0 0 1-6-6 19.79 19.79 0 0 1-3.07-8.67A2 2 0 0 1 4.11 2h3a2 2 0 0 1 2 1.72 12.84 12.84 0 0 0 .7 2.81 2 2 0 0 1-.45 2.11L8.09 9.91a16 16 0 0 0 6 6l1.27-1.27a2 2 0 0 1 2.11-.45 12.84 12.84 0 0 0 2.81.7A2 2 0 0 1 22 16.92z"
          {...common}
          {...round}
        />
      )}
      {name === "map" && (
        <>
          <Path d="M20 10c0 6-8 12-8 12s-8-6-8-12a8 8 0 0 1 16 0Z" {...common} {...round} />
          <Circle cx="12" cy="10" r="3" {...common} />
        </>
      )}
      {name === "globe" && (
        <>
          <Circle cx="12" cy="12" r="10" {...common} />
          <Path d="M12 2a14.5 14.5 0 0 0 0 20 14.5 14.5 0 0 0 0-20" {...common} {...round} />
          <Path d="M2 12h20" {...common} {...round} />
        </>
      )}
    </Svg>
  );
}

function contactList(pi: ResumeData["personalInfo"]): { icon: IconName; text: string }[] {
  return [
    { icon: "mail" as const, text: pi.email },
    { icon: "phone" as const, text: pi.phone },
    { icon: "map" as const, text: pi.location },
    { icon: "globe" as const, text: pi.website },
  ].filter((c): c is { icon: IconName; text: string } => Boolean(c.text));
}

function safe(data: ResumeData) {
  return {
    pi: data.personalInfo || ({} as ResumeData["personalInfo"]),
    experience: data.experience || [],
    education: data.education || [],
    certifications: data.certifications || [],
    skills: data.skills || [],
  };
}

// ===========================================================================
// Template 1 — MODERN (dark header band, indigo headings, skill pills)
// ===========================================================================
const MODERN_PAGE_PAD = 34;
const modern = StyleSheet.create({
  // paddingTop/Bottom give every page (incl. continuation pages) the same top
  // margin; the header uses a negative marginTop to bleed back to the very top
  // edge on page 1 so the dark band stays full-bleed there.
  page: { fontFamily: "Helvetica", color: C.slate900, fontSize: 10, lineHeight: 1.4, paddingTop: MODERN_PAGE_PAD, paddingBottom: MODERN_PAGE_PAD },
  header: { backgroundColor: C.slate900, color: C.white, paddingHorizontal: 40, paddingTop: 32, paddingBottom: 26, marginTop: -MODERN_PAGE_PAD },
  name: { fontFamily: "Helvetica-Bold", fontSize: 23, color: C.white, letterSpacing: -0.3, lineHeight: 1.2 },
  jobTitle: { fontSize: 12, color: C.slate300, marginTop: 6, marginBottom: 14, lineHeight: 1.2 },
  contactWrap: { flexDirection: "row", flexWrap: "wrap" },
  contactItem: { flexDirection: "row", alignItems: "center", marginRight: 16, marginBottom: 3 },
  contactIcon: { marginRight: 5 },
  contact: { fontSize: 9.5, color: C.slate400 },
  body: { paddingHorizontal: 40, paddingTop: 22 },
  section: { marginBottom: 18 },
  sectionTitle: {
    fontFamily: "Helvetica-Bold", fontSize: 9, color: C.indigo600, letterSpacing: 1.8,
    textTransform: "uppercase", borderBottomWidth: 1, borderBottomColor: C.slate200, paddingBottom: 5, marginBottom: 11,
  },
  summary: { fontSize: 10.5, color: C.slate600, lineHeight: 1.5 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 },
  itemTitle: { fontFamily: "Helvetica-Bold", fontSize: 11.5, color: C.slate900, flex: 1, paddingRight: 8 },
  itemDate: { fontSize: 9.5, color: C.slate500 },
  itemSub: { fontSize: 10.5, color: C.slate500 },
  entry: { marginBottom: 12 },
  entryHead: { marginBottom: 4 },
  bulletRow: { flexDirection: "row", marginBottom: 3, paddingRight: 4 },
  bulletDot: { width: 12, fontSize: 10.5, color: C.slate600 },
  bulletText: { flex: 1, fontSize: 10.5, color: C.slate600, lineHeight: 1.45 },
  paragraph: { fontSize: 10.5, color: C.slate600, lineHeight: 1.45 },
  skillsWrap: { flexDirection: "row", flexWrap: "wrap" },
  skillPill: {
    borderWidth: 1, borderColor: C.slate200, backgroundColor: C.slate50, borderRadius: 5,
    paddingVertical: 3, paddingHorizontal: 7, marginRight: 5, marginBottom: 5,
  },
  skillText: { fontSize: 9.5, color: C.slate700 },
});

function Bullets({ description, dotStyle, textStyle, paraStyle }: any) {
  const points = description ? toPoints(description) : [];
  if (points.length > 1) {
    return (
      <>
        {points.map((point, i) => (
          // wrap={false} keeps the dot and its text together so a bullet never
          // splits across a page break (lone "•" on one page, text on the next).
          <View key={i} style={{ flexDirection: "row", marginBottom: 3, paddingRight: 4 }} wrap={false}>
            <Text style={dotStyle}>•</Text>
            <Text style={textStyle}>{point}</Text>
          </View>
        ))}
      </>
    );
  }
  return description ? <Text style={paraStyle}>{description}</Text> : null;
}

function ModernTemplate({ data }: { data: ResumeData }) {
  const { pi, experience, education, certifications, skills } = safe(data);
  const contacts = contactList(pi);
  return (
    <Document title={pi.fullName || "Resume"} author={pi.fullName || "Resume"}>
      <Page size="LETTER" style={modern.page}>
        <View style={modern.header}>
          <Text style={modern.name}>{pi.fullName || "Your Name"}</Text>
          <Text style={modern.jobTitle}>{pi.jobTitle || "Job Title"}</Text>
          {contacts.length > 0 && (
            <View style={modern.contactWrap}>
              {contacts.map((c) => (
                <View key={c.icon} style={modern.contactItem}>
                  <View style={modern.contactIcon}><ContactIcon name={c.icon} color={C.slate400} /></View>
                  <Text style={modern.contact}>{c.text}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
        <View style={modern.body}>
          {pi.summary ? (
            <View style={modern.section}><Text style={modern.summary}>{pi.summary}</Text></View>
          ) : null}
          {experience.length > 0 && (
            <View style={modern.section}>
              <Text style={modern.sectionTitle}>Experience</Text>
              {experience.map((exp) => (
                <View key={exp.id} style={modern.entry}>
                  <View style={modern.entryHead} wrap={false}>
                    <View style={modern.itemRow}>
                      <Text style={modern.itemTitle}>{exp.position || "Position"}</Text>
                      <Text style={modern.itemDate}>{exp.startDate}{exp.startDate && exp.endDate ? " — " : ""}{exp.endDate}</Text>
                    </View>
                    <Text style={modern.itemSub}>{exp.company || "Company"}</Text>
                  </View>
                  <Bullets description={exp.description} dotStyle={modern.bulletDot} textStyle={modern.bulletText} paraStyle={modern.paragraph} />
                </View>
              ))}
            </View>
          )}
          {education.length > 0 && (
            <View style={modern.section}>
              <Text style={modern.sectionTitle}>Education</Text>
              {education.map((edu) => (
                <View key={edu.id} style={modern.entry} wrap={false}>
                  <View style={modern.itemRow}>
                    <Text style={modern.itemTitle}>{edu.institution || "Institution"}</Text>
                    <Text style={modern.itemDate}>{edu.startDate}{edu.startDate && edu.endDate ? " — " : ""}{edu.endDate}</Text>
                  </View>
                  <Text style={modern.itemSub}>{edu.degree || "Degree"}</Text>
                </View>
              ))}
            </View>
          )}
          {certifications.length > 0 && (
            <View style={modern.section}>
              <Text style={modern.sectionTitle}>Certifications</Text>
              {certifications.map((cert) => (
                <View key={cert.id} style={modern.entry} wrap={false}>
                  <View style={modern.itemRow}>
                    <Text style={modern.itemTitle}>{cert.name}</Text>
                    <Text style={modern.itemDate}>{cert.date}</Text>
                  </View>
                  <Text style={modern.itemSub}>{cert.issuer}</Text>
                </View>
              ))}
            </View>
          )}
          {skills.length > 0 && (
            <View style={modern.section}>
              <Text style={modern.sectionTitle}>Skills</Text>
              <View style={modern.skillsWrap}>
                {skills.map((skill, i) => (
                  <View key={i} style={modern.skillPill}><Text style={modern.skillText}>{skill}</Text></View>
                ))}
              </View>
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

// ===========================================================================
// Template 2 — CLASSIC (serif, centered header, rule dividers, ATS-safe)
// ===========================================================================
const classic = StyleSheet.create({
  page: { fontFamily: "Times-Roman", color: "#111827", fontSize: 10.5, lineHeight: 1.4, paddingHorizontal: 54, paddingTop: 40, paddingBottom: 40 },
  header: { alignItems: "center", borderBottomWidth: 1.5, borderBottomColor: "#111827", paddingBottom: 12, marginBottom: 14 },
  name: { fontFamily: "Times-Bold", fontSize: 24, letterSpacing: 1, textAlign: "center", lineHeight: 1.2 },
  jobTitle: { fontFamily: "Times-Roman", fontSize: 12, color: "#374151", marginTop: 5, textAlign: "center", lineHeight: 1.2 },
  contact: { fontSize: 9.5, color: "#374151", marginTop: 8, textAlign: "center" },
  section: { marginBottom: 15 },
  sectionTitle: { fontFamily: "Times-Bold", fontSize: 11.5, letterSpacing: 2, textTransform: "uppercase", borderBottomWidth: 0.75, borderBottomColor: "#9ca3af", paddingBottom: 3, marginBottom: 8 },
  summary: { fontSize: 10.5, color: "#1f2937", lineHeight: 1.5 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start" },
  itemTitle: { fontFamily: "Times-Bold", fontSize: 11.5, flex: 1, paddingRight: 8 },
  itemDate: { fontSize: 10, color: "#374151" },
  itemSub: { fontFamily: "Times-Italic", fontSize: 10.5, color: "#374151", marginBottom: 3 },
  entry: { marginBottom: 11 },
  entryHead: { marginBottom: 3 },
  bulletRow: { flexDirection: "row", marginBottom: 2.5, paddingRight: 4 },
  bulletDot: { width: 12, fontSize: 10.5 },
  bulletText: { flex: 1, fontSize: 10.5, color: "#1f2937", lineHeight: 1.45 },
  paragraph: { fontSize: 10.5, color: "#1f2937", lineHeight: 1.45 },
  skills: { fontSize: 10.5, color: "#1f2937", lineHeight: 1.5 },
});

function ClassicTemplate({ data }: { data: ResumeData }) {
  const { pi, experience, education, certifications, skills } = safe(data);
  const contacts = contactList(pi).map((c) => c.text);
  return (
    <Document title={pi.fullName || "Resume"} author={pi.fullName || "Resume"}>
      <Page size="LETTER" style={classic.page}>
        <View style={classic.header}>
          <Text style={classic.name}>{pi.fullName || "Your Name"}</Text>
          {pi.jobTitle ? <Text style={classic.jobTitle}>{pi.jobTitle}</Text> : null}
          {contacts.length > 0 ? <Text style={classic.contact}>{contacts.join("   |   ")}</Text> : null}
        </View>
        {pi.summary ? (
          <View style={classic.section}>
            <Text style={classic.sectionTitle}>Summary</Text>
            <Text style={classic.summary}>{pi.summary}</Text>
          </View>
        ) : null}
        {experience.length > 0 && (
          <View style={classic.section}>
            <Text style={classic.sectionTitle}>Experience</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={classic.entry}>
                <View style={classic.entryHead} wrap={false}>
                  <View style={classic.itemRow}>
                    <Text style={classic.itemTitle}>{exp.position || "Position"}</Text>
                    <Text style={classic.itemDate}>{exp.startDate}{exp.startDate && exp.endDate ? " — " : ""}{exp.endDate}</Text>
                  </View>
                  <Text style={classic.itemSub}>{exp.company || "Company"}</Text>
                </View>
                <Bullets description={exp.description} dotStyle={classic.bulletDot} textStyle={classic.bulletText} paraStyle={classic.paragraph} />
              </View>
            ))}
          </View>
        )}
        {education.length > 0 && (
          <View style={classic.section}>
            <Text style={classic.sectionTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={classic.entry} wrap={false}>
                <View style={classic.itemRow}>
                  <Text style={classic.itemTitle}>{edu.institution || "Institution"}</Text>
                  <Text style={classic.itemDate}>{edu.startDate}{edu.startDate && edu.endDate ? " — " : ""}{edu.endDate}</Text>
                </View>
                <Text style={classic.itemSub}>{edu.degree || "Degree"}</Text>
              </View>
            ))}
          </View>
        )}
        {certifications.length > 0 && (
          <View style={classic.section}>
            <Text style={classic.sectionTitle}>Certifications</Text>
            {certifications.map((cert) => (
              <View key={cert.id} style={classic.entry} wrap={false}>
                <View style={classic.itemRow}>
                  <Text style={classic.itemTitle}>{cert.name}</Text>
                  <Text style={classic.itemDate}>{cert.date}</Text>
                </View>
                <Text style={classic.itemSub}>{cert.issuer}</Text>
              </View>
            ))}
          </View>
        )}
        {skills.length > 0 && (
          <View style={classic.section}>
            <Text style={classic.sectionTitle}>Skills</Text>
            <Text style={classic.skills}>{skills.join("  •  ")}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

// ===========================================================================
// Template 3 — MINIMAL (airy, single teal accent, no band, no pills)
// ===========================================================================
const A = C.teal700;
const minimal = StyleSheet.create({
  page: { fontFamily: "Helvetica", color: C.slate800, fontSize: 10, lineHeight: 1.45, paddingHorizontal: 48, paddingTop: 44, paddingBottom: 40 },
  name: { fontFamily: "Helvetica-Bold", fontSize: 24, color: C.slate900, letterSpacing: -0.4, lineHeight: 1.2 },
  jobTitle: { fontSize: 12, color: A, marginTop: 5, marginBottom: 12, lineHeight: 1.2 },
  contactWrap: { flexDirection: "row", flexWrap: "wrap", marginBottom: 6 },
  contactItem: { flexDirection: "row", alignItems: "center", marginRight: 14, marginBottom: 3 },
  contactIcon: { marginRight: 5 },
  contact: { fontSize: 9.5, color: C.slate500 },
  rule: { borderBottomWidth: 1, borderBottomColor: C.slate200, marginTop: 8, marginBottom: 18 },
  section: { marginBottom: 18 },
  sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 10, color: A, letterSpacing: 2.5, textTransform: "uppercase", marginBottom: 10 },
  summary: { fontSize: 10.5, color: C.slate600, lineHeight: 1.55 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 },
  itemTitle: { fontFamily: "Helvetica-Bold", fontSize: 11.5, color: C.slate900, flex: 1, paddingRight: 8 },
  itemDate: { fontSize: 9.5, color: C.slate400 },
  itemSub: { fontSize: 10.5, color: A },
  entry: { marginBottom: 13 },
  entryHead: { marginBottom: 4 },
  bulletDot: { width: 12, fontSize: 10.5, color: A },
  bulletText: { flex: 1, fontSize: 10.5, color: C.slate600, lineHeight: 1.5 },
  paragraph: { fontSize: 10.5, color: C.slate600, lineHeight: 1.5 },
  skills: { fontSize: 10.5, color: C.slate700, lineHeight: 1.6 },
});

function MinimalTemplate({ data }: { data: ResumeData }) {
  const { pi, experience, education, certifications, skills } = safe(data);
  const contacts = contactList(pi);
  return (
    <Document title={pi.fullName || "Resume"} author={pi.fullName || "Resume"}>
      <Page size="LETTER" style={minimal.page}>
        <Text style={minimal.name}>{pi.fullName || "Your Name"}</Text>
        <Text style={minimal.jobTitle}>{pi.jobTitle || "Job Title"}</Text>
        {contacts.length > 0 && (
          <View style={minimal.contactWrap}>
            {contacts.map((c) => (
              <View key={c.icon} style={minimal.contactItem}>
                <View style={minimal.contactIcon}><ContactIcon name={c.icon} color={C.slate500} /></View>
                <Text style={minimal.contact}>{c.text}</Text>
              </View>
            ))}
          </View>
        )}
        <View style={minimal.rule} />
        {pi.summary ? (
          <View style={minimal.section}><Text style={minimal.summary}>{pi.summary}</Text></View>
        ) : null}
        {experience.length > 0 && (
          <View style={minimal.section}>
            <Text style={minimal.sectionTitle}>Experience</Text>
            {experience.map((exp) => (
              <View key={exp.id} style={minimal.entry}>
                <View style={minimal.entryHead} wrap={false}>
                  <View style={minimal.itemRow}>
                    <Text style={minimal.itemTitle}>{exp.position || "Position"}</Text>
                    <Text style={minimal.itemDate}>{exp.startDate}{exp.startDate && exp.endDate ? " — " : ""}{exp.endDate}</Text>
                  </View>
                  <Text style={minimal.itemSub}>{exp.company || "Company"}</Text>
                </View>
                <Bullets description={exp.description} dotStyle={minimal.bulletDot} textStyle={minimal.bulletText} paraStyle={minimal.paragraph} />
              </View>
            ))}
          </View>
        )}
        {education.length > 0 && (
          <View style={minimal.section}>
            <Text style={minimal.sectionTitle}>Education</Text>
            {education.map((edu) => (
              <View key={edu.id} style={minimal.entry} wrap={false}>
                <View style={minimal.itemRow}>
                  <Text style={minimal.itemTitle}>{edu.institution || "Institution"}</Text>
                  <Text style={minimal.itemDate}>{edu.startDate}{edu.startDate && edu.endDate ? " — " : ""}{edu.endDate}</Text>
                </View>
                <Text style={minimal.itemSub}>{edu.degree || "Degree"}</Text>
              </View>
            ))}
          </View>
        )}
        {certifications.length > 0 && (
          <View style={minimal.section}>
            <Text style={minimal.sectionTitle}>Certifications</Text>
            {certifications.map((cert) => (
              <View key={cert.id} style={minimal.entry} wrap={false}>
                <View style={minimal.itemRow}>
                  <Text style={minimal.itemTitle}>{cert.name}</Text>
                  <Text style={minimal.itemDate}>{cert.date}</Text>
                </View>
                <Text style={minimal.itemSub}>{cert.issuer}</Text>
              </View>
            ))}
          </View>
        )}
        {skills.length > 0 && (
          <View style={minimal.section}>
            <Text style={minimal.sectionTitle}>Skills</Text>
            <Text style={minimal.skills}>{skills.join("   ·   ")}</Text>
          </View>
        )}
      </Page>
    </Document>
  );
}

// ===========================================================================
// Template 4 — TWO-COLUMN SIDEBAR (dark left rail: contact + skills)
// ===========================================================================
const SIDEBAR_W = 176;
const SIDEBAR_PAGE_PAD = 34;
const sidebar = StyleSheet.create({
  // paddingTop/Bottom give both columns the same top margin on every page,
  // including continuation pages. The rail is absolutely positioned so it
  // ignores that padding and still spans the full page height.
  page: { fontFamily: "Helvetica", color: C.slate800, fontSize: 10, lineHeight: 1.45, flexDirection: "row", paddingTop: SIDEBAR_PAGE_PAD, paddingBottom: SIDEBAR_PAGE_PAD },
  // Full-height dark band behind the left column (repeats every page).
  rail: { position: "absolute", top: 0, bottom: 0, left: 0, width: SIDEBAR_W, backgroundColor: C.slate900 },
  side: { width: SIDEBAR_W, paddingHorizontal: 20 },
  main: { flex: 1, paddingHorizontal: 26 },
  name: { fontFamily: "Helvetica-Bold", fontSize: 18, color: C.white, lineHeight: 1.2 },
  jobTitle: { fontSize: 10.5, color: C.slate400, marginTop: 5, marginBottom: 18 },
  sideTitle: { fontFamily: "Helvetica-Bold", fontSize: 8.5, color: C.slate400, letterSpacing: 1.5, textTransform: "uppercase", marginBottom: 7, marginTop: 14 },
  sideContactItem: { flexDirection: "row", alignItems: "flex-start", marginBottom: 5 },
  sideContactIcon: { marginRight: 6, marginTop: 1 },
  sideContactText: { fontSize: 9, color: C.slate300, flex: 1 },
  sideSkill: { fontSize: 9.5, color: C.slate300, marginBottom: 4 },
  section: { marginBottom: 16 },
  sectionTitle: { fontFamily: "Helvetica-Bold", fontSize: 10, color: C.slate900, letterSpacing: 1.5, textTransform: "uppercase", borderBottomWidth: 1, borderBottomColor: C.slate200, paddingBottom: 4, marginBottom: 9 },
  summary: { fontSize: 10, color: C.slate600, lineHeight: 1.5 },
  itemRow: { flexDirection: "row", justifyContent: "space-between", alignItems: "flex-start", marginBottom: 2 },
  itemTitle: { fontFamily: "Helvetica-Bold", fontSize: 11, color: C.slate900, flex: 1, paddingRight: 6 },
  itemDate: { fontSize: 9, color: C.slate500 },
  itemSub: { fontSize: 10, color: C.indigo600 },
  entry: { marginBottom: 11 },
  entryHead: { marginBottom: 3 },
  bulletDot: { width: 11, fontSize: 10, color: C.slate500 },
  bulletText: { flex: 1, fontSize: 10, color: C.slate600, lineHeight: 1.45 },
  paragraph: { fontSize: 10, color: C.slate600, lineHeight: 1.45 },
});

function SidebarTemplate({ data }: { data: ResumeData }) {
  const { pi, experience, education, certifications, skills } = safe(data);
  const contacts = contactList(pi);
  return (
    <Document title={pi.fullName || "Resume"} author={pi.fullName || "Resume"}>
      <Page size="LETTER" style={sidebar.page}>
        <View style={sidebar.rail} fixed />
        {/* Left rail */}
        <View style={sidebar.side}>
          <Text style={sidebar.name}>{pi.fullName || "Your Name"}</Text>
          <Text style={sidebar.jobTitle}>{pi.jobTitle || "Job Title"}</Text>
          {contacts.length > 0 && (
            <View>
              <Text style={sidebar.sideTitle}>Contact</Text>
              {contacts.map((c) => (
                <View key={c.icon} style={sidebar.sideContactItem}>
                  <View style={sidebar.sideContactIcon}><ContactIcon name={c.icon} color={C.slate400} size={8} /></View>
                  <Text style={sidebar.sideContactText}>{c.text}</Text>
                </View>
              ))}
            </View>
          )}
          {skills.length > 0 && (
            <View>
              <Text style={sidebar.sideTitle}>Skills</Text>
              {skills.map((skill, i) => (
                <Text key={i} style={sidebar.sideSkill}>{skill}</Text>
              ))}
            </View>
          )}
        </View>
        {/* Main column */}
        <View style={sidebar.main}>
          {pi.summary ? (
            <View style={sidebar.section}>
              <Text style={sidebar.sectionTitle}>Summary</Text>
              <Text style={sidebar.summary}>{pi.summary}</Text>
            </View>
          ) : null}
          {experience.length > 0 && (
            <View style={sidebar.section}>
              <Text style={sidebar.sectionTitle}>Experience</Text>
              {experience.map((exp) => (
                <View key={exp.id} style={sidebar.entry}>
                  <View style={sidebar.entryHead} wrap={false}>
                    <View style={sidebar.itemRow}>
                      <Text style={sidebar.itemTitle}>{exp.position || "Position"}</Text>
                      <Text style={sidebar.itemDate}>{exp.startDate}{exp.startDate && exp.endDate ? " — " : ""}{exp.endDate}</Text>
                    </View>
                    <Text style={sidebar.itemSub}>{exp.company || "Company"}</Text>
                  </View>
                  <Bullets description={exp.description} dotStyle={sidebar.bulletDot} textStyle={sidebar.bulletText} paraStyle={sidebar.paragraph} />
                </View>
              ))}
            </View>
          )}
          {education.length > 0 && (
            <View style={sidebar.section}>
              <Text style={sidebar.sectionTitle}>Education</Text>
              {education.map((edu) => (
                <View key={edu.id} style={sidebar.entry} wrap={false}>
                  <View style={sidebar.itemRow}>
                    <Text style={sidebar.itemTitle}>{edu.institution || "Institution"}</Text>
                    <Text style={sidebar.itemDate}>{edu.startDate}{edu.startDate && edu.endDate ? " — " : ""}{edu.endDate}</Text>
                  </View>
                  <Text style={sidebar.itemSub}>{edu.degree || "Degree"}</Text>
                </View>
              ))}
            </View>
          )}
          {certifications.length > 0 && (
            <View style={sidebar.section}>
              <Text style={sidebar.sectionTitle}>Certifications</Text>
              {certifications.map((cert) => (
                <View key={cert.id} style={sidebar.entry} wrap={false}>
                  <View style={sidebar.itemRow}>
                    <Text style={sidebar.itemTitle}>{cert.name}</Text>
                    <Text style={sidebar.itemDate}>{cert.date}</Text>
                  </View>
                  <Text style={sidebar.itemSub}>{cert.issuer}</Text>
                </View>
              ))}
            </View>
          )}
        </View>
      </Page>
    </Document>
  );
}

// ===========================================================================
// Registry + public API
// ===========================================================================
const TEMPLATE_COMPONENTS: Record<TemplateId, (p: { data: ResumeData }) => ReactElement> = {
  modern: ModernTemplate,
  classic: ClassicTemplate,
  minimal: MinimalTemplate,
  sidebar: SidebarTemplate,
};

export function ResumeDocument({ data, templateId }: { data: ResumeData; templateId: TemplateId }) {
  const Template = TEMPLATE_COMPONENTS[templateId] || ModernTemplate;
  return <Template data={data} />;
}

// Render the selected template to a Blob for the on-device download flow.
export async function generateResumePdfBlob(data: ResumeData, templateId: TemplateId = DEFAULT_TEMPLATE): Promise<Blob> {
  return await pdf(<ResumeDocument data={data} templateId={templateId} />).toBlob();
}
