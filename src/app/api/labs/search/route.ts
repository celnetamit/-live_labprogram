import { NextResponse } from "next/server";
import prisma from "@/lib/prisma";
import { EXPLORE_STATUSES } from "@/lib/labStatus";

/**
 * Typeahead suggestions for the header search.
 *
 * Deliberately narrow: it returns only what a suggestion row renders and never
 * price, ownership or access data. The header is public, so this endpoint is
 * reachable signed out, and anything it returned would be readable by anyone.
 * The catalogue page still owns the full result view — this only helps a visitor
 * get there.
 *
 * The client debounces before calling, but the guards below are enforced here
 * too: a public endpoint cannot assume its caller is the component that ships
 * with it.
 */

export const dynamic = "force-dynamic";

/** Below this, matches are too broad to be useful and too expensive to serve. */
const MIN_QUERY_LENGTH = 1;
/** A dropdown is a shortlist. More rows than this belongs on the catalogue page. */
const MAX_RESULTS = 6;
/** Caps the work a single request can ask the database to do. */
const MAX_QUERY_LENGTH = 64;

export async function GET(request: Request) {
  const raw = new URL(request.url).searchParams.get("q") ?? "";
  const q = raw.trim().slice(0, MAX_QUERY_LENGTH);

  if (q.length < MIN_QUERY_LENGTH) {
    return NextResponse.json({ query: q, results: [] });
  }

  try {
    const labs = await prisma.lab.findMany({
      where: {
        enabled: true,
        status: { in: [...EXPLORE_STATUSES] },
        // Same fields the catalogue filters on, so a suggestion can never point
        // at a lab that the destination page then filters out.
        OR: [
          { name: { contains: q, mode: "insensitive" } },
          { synopsis: { contains: q, mode: "insensitive" } },
          { subject: { contains: q, mode: "insensitive" } },
          { keySkills: { contains: q, mode: "insensitive" } },
        ],
      },
      select: {
        id: true,
        slug: true,
        name: true,
        subject: true,
        difficulty: true,
        status: true,
      },
      // Over-fetch a little so the name-first ranking below has something to
      // reorder; the list is trimmed to MAX_RESULTS after sorting.
      take: MAX_RESULTS * 3,
      orderBy: { name: "asc" },
    });

    const needle = q.toLowerCase();
    const rank = (name: string): number => {
      const haystack = name.toLowerCase();
      // A title that starts with what you typed is almost always the one you
      // meant; a title that merely contains it comes next; a match found only in
      // the synopsis or skills ranks last.
      if (haystack.startsWith(needle)) return 0;
      if (haystack.includes(needle)) return 1;
      return 2;
    };

    const results = labs
      .filter((lab) => lab.slug)
      .sort((a, b) => rank(a.name) - rank(b.name) || a.name.localeCompare(b.name))
      .slice(0, MAX_RESULTS)
      .map((lab) => ({
        id: lab.id,
        slug: lab.slug as string,
        name: lab.name,
        subject: lab.subject ?? "",
        difficulty: lab.difficulty ?? "",
        status: lab.status,
      }));

    return NextResponse.json({ query: q, results });
  } catch {
    // A failed lookup must not break the header. The client treats an error as
    // "no suggestions" and the form still submits to the catalogue on Enter.
    return NextResponse.json({ query: q, results: [] }, { status: 200 });
  }
}
