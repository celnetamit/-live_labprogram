const crypto = require("node:crypto");

const SECRET = process.env.NEXTAUTH_SECRET || "O2gIVN+rXxnuzSq5Nh38aJGBQ4wKrjtkJD/4I0j4lS0=";

function generateLabToken(payload, ttlSeconds = 300) {
  const exp = Math.floor(Date.now() / 1000) + ttlSeconds;
  const fullPayload = { ...payload, exp };
  const encodedPayload = Buffer.from(JSON.stringify(fullPayload), "utf8").toString("base64url");
  const signature = crypto
    .createHmac("sha256", SECRET)
    .update(encodedPayload)
    .digest("base64url");
  return `${encodedPayload}.${signature}`;
}

async function run() {
  const token = generateLabToken({
    userId: "cmrt3ls780000n301yni18twl",
    email: "user@gmail.com",
    role: "USER",
    labId: "cmroiss8q000xqy8bp9870u3v",
  });
  console.log("Token:", token);

  const res = await fetch("https://live-labs.org/api/auth/authorize-lab", {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({
      token,
      domainUrl: "https://denovo.live-labs.org",
    }),
  });

  const text = await res.text();
  console.log("Status:", res.status);
  console.log("Response:", text);
}
run();
