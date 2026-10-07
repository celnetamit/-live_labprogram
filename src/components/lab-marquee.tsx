"use client";

import Link from "next/link";
import Image from "next/image";

/*
  The thirteen laboratories, running past.

  Each tile is a real lab, links to its guide, and carries the same picture
  the catalogue card carries — the cover photograph where one exists, the
  lab's own demo poster where one does not. That is the rule in
  `labImage()` (src/lib/learnerLabs.ts), and the sources below are copied
  from the `COVER_PHOTO` map beside it rather than imported: that module
  pulls in the whole guide index, which is not weight the home page should
  carry for thirteen strings. If a cover is re-cropped there, change it here
  too — the filenames are content-hashed, so a stale one 404s rather than
  silently showing the old picture.

  The strip is one list rendered twice and translated by exactly half its
  width, which is what makes the loop seamless: at -50% the second copy sits
  precisely where the first began, so the reset is invisible.
*/

/*
  Name and subject are the Lab table's own values, read from it rather than
  written here from memory: an earlier pass invented "Chemistry",
  "Communications", "Document AI" and "Guidance", which made nine subjects
  appear under a heading that says seven. There are seven, and these are
  they. To re-check after a catalogue change:

    SELECT slug, subject, name FROM "Lab" WHERE status = 'ACTIVE' ORDER BY name;

  The order below is editorial — it opens on the strongest photographs — but
  the strings are not.
*/
const LABS = [
  { slug: "metamaterials", name: "Pioneering Acoustic Metamaterials", subject: "Materials", src: "/labs/metamaterials.8c99e225.jpg" },
  { slug: "micro-ai", name: "MicrobeAI Lab", subject: "Biology", src: "/labs/micro-ai.0ec11f8b.jpg" },
  { slug: "drugdiscovery-ai", name: "RepurposeAI: Drug Discovery Lab", subject: "Biology", src: "/labs/drugdiscovery-ai.5f1f39da.jpg" },
  { slug: "virtual-ai", name: "XRD Virtual Laboratory", subject: "Physics", src: "/labs/virtual-ai.82c2a62d.jpg" },
  { slug: "omicslab", name: "OmicsLab Pro", subject: "Biology", src: "/labs/omicslab.9a645e33.jpg" },
  { slug: "logiclab", name: "LogicLab AI", subject: "Electronics", src: "/labs/logiclab.32701fc0.jpg" },
  { slug: "fraudshield", name: "FraudShield AI Lab", subject: "Security", src: "/labs/fraudshield.ee467982.jpg" },
  { slug: "smartfactory-ai", name: "SmartFactory AI", subject: "Engineering", src: "/demos/smartfactory-ai.jpg" },
  { slug: "denovo-genai-lab", name: "Denovo GenAI Lab", subject: "Computer Science", src: "/labs/denovo-genai-lab.9d533526.jpg" },
  { slug: "battery-ai", name: "Battery Circularity AI", subject: "Engineering", src: "/labs/battery-ai.1f25baae.jpg" },
  { slug: "ai-6g", name: "AI For 6G Experimental Learning", subject: "Electronics", src: "/labs/ai-6g.41186ec2.jpg" },
  { slug: "cognicore-ai", name: "Cognicore AI", subject: "Computer Science", src: "/labs/cognicore-ai.986765af.jpg" },
  { slug: "ai-program-navigator", name: "Live-Lab Learning: AI Program Navigator", subject: "Computer Science", src: "/demos/ai-program-navigator.jpg" },
];

function Tile({ lab, hidden }: { lab: (typeof LABS)[number]; hidden?: boolean }) {
  return (
    <Link
      href={`/labs/${lab.slug}`}
      className="lab-strip-tile focus-ring"
      /* The second copy exists only to make the loop seamless, so it is
         hidden from assistive tech and taken out of the tab order rather
         than offering every lab twice. */
      aria-hidden={hidden || undefined}
      tabIndex={hidden ? -1 : undefined}
    >
      {/*
        Eager, not lazy. A tile three thousand pixels off to the right is far
        outside any lazy-loading threshold, so it would still be empty at the
        moment the roll carries it into view — the strip would show blanks
        filling in rather than thirteen laboratories. There are only thirteen
        distinct URLs across the two copies, and `sizes` holds the request to
        the width actually painted, so eager here is thirteen small images,
        not twenty-six large ones.
      */}
      <Image
        src={lab.src}
        alt=""
        fill
        sizes="(max-width: 640px) 200px, 280px"
        loading="eager"
        className="object-cover"
      />
      <span className="lab-strip-scrim" aria-hidden />
      <span className="lab-strip-meta">
        <span className="lab-strip-subject">{lab.subject}</span>
        <span className="lab-strip-name">{lab.name}</span>
      </span>
    </Link>
  );
}

export default function LabMarquee() {
  return (
    <div className="lab-strip" role="region" aria-label="The thirteen laboratories">
      <div className="lab-strip-track">
        {LABS.map((lab) => (
          <Tile key={lab.slug} lab={lab} />
        ))}
        {LABS.map((lab) => (
          <Tile key={`${lab.slug}-copy`} lab={lab} hidden />
        ))}
      </div>
    </div>
  );
}
