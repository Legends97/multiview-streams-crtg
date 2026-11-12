import { z } from "zod";

/**
 * Schemas für die zentrale Konfiguration in src/config/.
 * Sie laufen beim Import der Config-Dateien und brechen Build bzw. Start mit
 * einer sprechenden Meldung ab — besser als ein schwarzes Tile im Rennen.
 */

export const streamConfigSchema = z.object({
  id: z
    .string()
    .regex(/^[a-z0-9-]{2,40}$/, "id: nur a-z, 0-9 und Bindestrich, 2-40 Zeichen"),
  name: z.string().min(1).max(40),
  twitchChannel: z
    .string()
    .regex(
      /^[a-zA-Z0-9_]{4,25}$/,
      "twitchChannel: Twitch-Login (4-25 Zeichen, keine URL)",
    )
    .transform((value) => value.toLowerCase()),
  role: z.string().min(1).max(30),
  active: z.boolean(),
  priority: z.number().int().positive().optional(),
  avatar: z.string().startsWith("/", "avatar: Pfad muss mit / beginnen").optional(),
  description: z.string().max(200).optional(),
  car: z.string().min(1).max(40).optional(),
  carNumber: z.number().int().positive().max(999).optional(),
  carClass: z.string().min(1).max(20).optional(),
});

export const streamsSchema = z
  .array(streamConfigSchema)
  .min(1, "Mindestens ein Stream muss konfiguriert sein")
  .max(16, "Mehr als 16 Streams werden nicht unterstützt")
  .superRefine((list, ctx) => {
    const seenIds = new Set<string>();
    const seenChannels = new Set<string>();

    for (const stream of list) {
      if (seenIds.has(stream.id)) {
        ctx.addIssue({ code: "custom", message: `Doppelte id: ${stream.id}` });
      }
      seenIds.add(stream.id);

      if (seenChannels.has(stream.twitchChannel)) {
        ctx.addIssue({
          code: "custom",
          message: `Doppelter twitchChannel: ${stream.twitchChannel}`,
        });
      }
      seenChannels.add(stream.twitchChannel);
    }

    if (!list.some((stream) => stream.active)) {
      ctx.addIssue({
        code: "custom",
        message: "Mindestens ein Stream muss active: true sein",
      });
    }
  });

/** ISO-8601 mit Zeitzonen-Offset — ohne Offset rechnen Clients falsch. */
const isoWithOffset = z
  .string()
  .regex(
    /^\d{4}-\d{2}-\d{2}T\d{2}:\d{2}(:\d{2})?(\.\d+)?(Z|[+-]\d{2}:\d{2})$/,
    "Zeitangabe muss ISO-8601 mit Zeitzonen-Offset sein, z. B. 2027-05-15T14:00:00+02:00",
  )
  .refine((value) => !Number.isNaN(Date.parse(value)), "Zeitangabe ist kein gültiges Datum");

export const raceConfigSchema = z.object({
  name: z.string().min(1).max(80),
  series: z.string().min(1).max(60),
  class: z.string().min(1).max(30),
  track: z.object({
    name: z.string().min(1).max(80),
    country: z.string().regex(/^[A-Z]{2}$/, "country: ISO-3166-1 Alpha-2, z. B. BE"),
    lengthKm: z.number().positive().max(30),
    turns: z.number().int().positive().max(300).optional(),
    layoutImage: z.string().startsWith("/").optional(),
  }),
  team: z.object({
    name: z.string().min(1).max(60),
    carNumber: z.number().int().positive().max(999).optional(),
    car: z.string().min(1).max(60).optional(),
    logo: z.string().startsWith("/").optional(),
  }),
  startsAt: isoWithOffset,
  durationHours: z.number().positive().max(48),
  simulator: z.string().min(1).max(40),
});

export const eventConfigSchema = z.object({
  title: z.string().min(1).max(60),
  browserTitle: z.string().min(1).max(60).optional(),
  subtitle: z.string().min(1).max(120),
  description: z.string().min(1).max(600),
  teamDescription: z.string().min(1).max(2000),
  facts: z
    .array(
      z.object({
        label: z.string().min(1).max(40),
        value: z.string().min(1).max(120),
      }),
    )
    .max(12),
  schedule: z
    .array(
      z.object({
        label: z.string().min(1).max(40),
        at: isoWithOffset,
        durationMinutes: z.number().int().positive().max(1440).optional(),
      }),
    )
    .max(20),
  social: z
    .array(
      z.object({
        platform: z.enum([
          "twitch",
          "youtube",
          "instagram",
          "discord",
          "x",
          "tiktok",
          "website",
        ]),
        label: z.string().min(1).max(40),
        url: z.url("social.url muss eine vollständige URL sein"),
      }),
    )
    .max(10),
  sponsors: z
    .array(
      z.object({
        name: z.string().min(1).max(60),
        logo: z.string().startsWith("/", "sponsors.logo: Pfad muss mit / beginnen"),
        url: z.url().optional(),
        tier: z.enum(["main", "partner"]),
      }),
    )
    .max(40),
});

export const layoutPresetSchema = z.object({
  id: z.enum(["single", "dual", "triple", "quad", "six", "eight"]),
  label: z.string().min(1).max(30),
  slots: z.number().int().min(1).max(8),
  grid: z.object({
    cols: z.number().int().min(1).max(4),
    rows: z.number().int().min(1).max(4),
  }),
  featured: z.boolean().optional(),
  heavy: z.boolean().optional(),
});

export const layoutsSchema = z
  .array(layoutPresetSchema)
  .min(1)
  .superRefine((list, ctx) => {
    for (const preset of list) {
      if (preset.grid.cols * preset.grid.rows < preset.slots) {
        ctx.addIssue({
          code: "custom",
          message: `Layout ${preset.id}: grid (${preset.grid.cols}x${preset.grid.rows}) hat weniger Zellen als slots (${preset.slots})`,
        });
      }
    }
  });

/**
 * Parst einen Config-Wert und wirft bei Fehlern eine lesbare Meldung,
 * die die betroffene Datei nennt.
 */
export function parseConfig<T>(schema: z.ZodType<T>, value: unknown, file: string): T {
  const result = schema.safeParse(value);

  if (!result.success) {
    throw new Error(
      `Ungültige Konfiguration in ${file}:\n${z.prettifyError(result.error)}`,
    );
  }

  return result.data;
}
