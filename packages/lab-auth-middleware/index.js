const fs = require('node:fs');
const path = require('node:path');
const http = require('node:http');
const https = require('node:https');

/**
 * Creates reusable Express / Node / Next.js middleware that verifies access
 * with the central Panoptical authorization API before allowing requests.
 *
 * @param {Object} options
 * @param {string} options.centralAuthUrl - e.g. "https://live-labs.org/api/auth/authorize-lab"
 * @param {string} options.loginUrl - e.g. "https://live-labs.org/login"
 * @param {string|function} options.labId - e.g. "lab1" or (req) => "lab1"
 * @param {string} [options.cookieName="__lab_auth_token"] - Cookie name for session caching
 */
function createLabAuthMiddleware(options = {}) {
  const centralAuthUrl = options.centralAuthUrl || process.env.CENTRAL_AUTH_URL || "https://live-labs.org/api/auth/authorize-lab";
  const loginUrl = options.loginUrl || process.env.CENTRAL_LOGIN_URL || "https://live-labs.org/login";
  const cookieName = options.cookieName || "__lab_auth_token";

  let accessDeniedHtml = "";
  try {
    const htmlPath = path.join(__dirname, "access-denied.html");
    if (fs.existsSync(htmlPath)) {
      accessDeniedHtml = fs.readFileSync(htmlPath, "utf8");
    }
  } catch {
    // fallback string below
  }

  if (!accessDeniedHtml) {
    accessDeniedHtml = `<!DOCTYPE html><html><head><title>403 - Access Denied</title></head><body style="font-family:sans-serif;background:#0f172a;color:#fff;display:flex;align-items:center;justify-content:center;height:100vh;"><div style="text-align:center;padding:2rem;background:#1e293b;border-radius:1rem;border:1px solid #334155;"><h1>403 – Access Denied</h1><p>You are not authorized to access this lab.</p></div></body></html>`;
  }

  return async function labAuthMiddleware(req, res, next) {
    try {
      const host = req.headers.host || "localhost";
      const protocol = req.headers["x-forwarded-proto"] || (req.connection && req.connection.encrypted ? "https" : "http");
      const fullUrl = new URL(req.url, `${protocol}://${host}`);

      // Allow static assets and favicon without verification call
      if (
        fullUrl.pathname.startsWith("/_next") ||
        fullUrl.pathname.startsWith("/static") ||
        fullUrl.pathname.match(/\.(ico|png|jpg|jpeg|svg|css|js|woff2?)$/)
      ) {
        return typeof next === "function" ? next() : undefined;
      }

      // 1. Extract token from URL query or Cookie header
      let token = fullUrl.searchParams.get("auth_token");
      let fromQuery = false;
      if (token) {
        fromQuery = true;
      } else if (req.headers.cookie) {
        const cookies = parseCookies(req.headers.cookie);
        token = cookies[cookieName] || cookies["next-auth.session-token"] || cookies["__Secure-next-auth.session-token"];
      }

      // If no token at all -> Redirect to Central Login
      if (!token) {
        const callbackUrl = encodeURIComponent(`${protocol}://${host}${req.url}`);
        const redirectUrl = `${loginUrl}?callbackUrl=${callbackUrl}`;
        if (res.redirect) {
          return res.redirect(redirectUrl);
        } else {
          res.writeHead(302, { Location: redirectUrl });
          return res.end();
        }
      }

      // Determine labId
      const labId = typeof options.labId === "function" ? options.labId(req) : (options.labId || process.env.LAB_ID || fullUrl.hostname);

      // 2. Call Central Authorization Service
      const verifyRes = await makeJsonRequest(centralAuthUrl, {
        token,
        labId,
        domainUrl: `${protocol}://${host}${fullUrl.pathname}`,
      });

      if (!verifyRes || !verifyRes.authorized) {
        // Return HTTP 403 Forbidden
        const message = verifyRes && verifyRes.message ? verifyRes.message : "You are not authorized to access this lab.";
        const customHtml = accessDeniedHtml.replace("You are not authorized to access this lab.", message);

        if (res.status) res.status(403);
        else res.statusCode = 403;

        res.setHeader("Content-Type", "text/html; charset=utf-8");
        return res.end(customHtml);
      }

      // 3. Authorized! If token came from URL parameter, cache it in cookie and redirect cleanly without ?auth_token=
      if (fromQuery) {
        const cookieVal = `${cookieName}=${token}; Path=/; HttpOnly; SameSite=Lax${protocol === "https" ? "; Secure" : ""}; Max-Age=28800`;
        res.setHeader("Set-Cookie", cookieVal);
        fullUrl.searchParams.delete("auth_token");
        const cleanUrl = fullUrl.pathname + (fullUrl.search ? fullUrl.search : "");
        if (res.redirect) {
          return res.redirect(cleanUrl);
        } else {
          res.writeHead(302, { Location: cleanUrl });
          return res.end();
        }
      }

      // Attach user & lab info to req object for lab usage
      req.labUser = verifyRes.user;
      req.labInfo = verifyRes.lab;

      if (typeof next === "function") return next();
    } catch (err) {
      console.error("[LabAuthMiddleware] Verification error:", err.message);
      if (res.status) res.status(500);
      else res.statusCode = 500;
      res.setHeader("Content-Type", "text/html; charset=utf-8");
      return res.end(`<h1>500 Internal Server Error</h1><p>Unable to verify lab authorization.</p>`);
    }
  };
}

function parseCookies(cookieHeader) {
  const list = {};
  cookieHeader &&
    cookieHeader.split(";").forEach((cookie) => {
      const parts = cookie.split("=");
      list[parts.shift().trim()] = decodeURI(parts.join("="));
    });
  return list;
}

function makeJsonRequest(urlStr, data) {
  return new Promise((resolve) => {
    try {
      const u = new URL(urlStr);
      const postData = JSON.stringify(data);
      const reqModule = u.protocol === "https:" ? https : http;

      const req = reqModule.request(
        u,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            "Content-Length": Buffer.byteLength(postData),
          },
          timeout: 6000,
        },
        (res) => {
          let body = "";
          res.on("data", (chunk) => (body += chunk));
          res.on("end", () => {
            try {
              resolve(JSON.parse(body));
            } catch {
              resolve(null);
            }
          });
        }
      );

      req.on("error", () => resolve(null));
      req.on("timeout", () => {
        req.destroy();
        resolve(null);
      });

      req.write(postData);
      req.end();
    } catch {
      resolve(null);
    }
  });
}

module.exports = { createLabAuthMiddleware };
