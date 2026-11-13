import { FAQ_EN } from "../../src/text/faq.en";

const BANNED = /\b(diagnos\w*|insomnia|apnea|disorder\w*|treatment\w*)\b/i;
const ALLOWED_EMAIL = "contactus@whitepixeltechnologies.in";
const words = (s: string) => s.trim().split(/\s+/).length;

describe("FAQ content (PRD 8.5, 9.13.1)", () => {
  test("has exactly 10 unique entries", () => {
    expect(FAQ_EN).toHaveLength(10);
    expect(new Set(FAQ_EN.map((f) => f.id)).size).toBe(10);
  });

  test.each(FAQ_EN.map((f) => [f.id, f.answer] as const))("%s follows the rules", (_id, a) => {
    expect(words(a)).toBeLessThan(80);
    expect(a).not.toMatch(BANNED);
    expect(a).not.toMatch(/WPT\s*202/i);
    expect((a.match(/!/g) ?? []).length).toBeLessThanOrEqual(1);
    (a.match(/[\w.+-]+@[\w.-]+/g) ?? []).forEach((e) => expect(e).toBe(ALLOWED_EMAIL));
    expect(a).not.toMatch(/\+?\d[\d\s-]{8,}/); // no phone numbers
  });

  test("key copy is present", () => {
    const get = (id: string) => FAQ_EN.find((f) => f.id === id)!.answer;
    expect(get("app-blocking")).toContain("App blocking is coming to iPhone soon.");
    expect(get("privacy-and-delete")).toContain('Settings → Privacy and data → "Delete all data"');
    expect(get("alarm-needs-mission")).toMatch(/never blocked/);
    expect(get("rest-nights")).toMatch(/two rest nights in any seven sleep days/);
    expect(get("sleep-score")).toMatch(/estimate/);
    expect(get("sleep-score")).toMatch(/not a medical measurement/);
    expect(get("alarm-didnt-ring")).toMatch(/volume/);
  });
});
