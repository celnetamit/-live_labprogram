import Link from "next/link";
import { ArrowRight } from "lucide-react";

/*
  The site footer.

  Lifted out of the home page so every public surface carries the same one:
  the catalogue, a lab guide, the blog and the legal pages all ended their
  pages differently, and two of them had no footer links at all. `.els` scopes
  the editorial system to this element, so a page that is otherwise on the
  older `.viv-*` system can mount it without its own type being touched.
*/
export default function EditorialFooter() {
  return (
        <footer className="els els-footer">
          <div className="els-shell">
            <div className="els-grid els-grid-4">
              <div>
                <h2>Product</h2>
                <ul>
                  <li><Link href="/labs">Explore labs <ArrowRight aria-hidden="true" /></Link></li>
                  <li><Link href="/#learning-approach">Learning approach <ArrowRight aria-hidden="true" /></Link></li>
                  {/* "For educators" has no page of its own yet, so it points at
                      the audience section that addresses them. */}
                  <li><Link href="/#audience">For educators <ArrowRight aria-hidden="true" /></Link></li>
                  <li><Link href="/blog">Blog <ArrowRight aria-hidden="true" /></Link></li>
                </ul>
              </div>
              <div>
                <h2>Account</h2>
                <ul>
                  <li><Link href="/login">Sign in <ArrowRight aria-hidden="true" /></Link></li>
                  <li><Link href="/register">Register <ArrowRight aria-hidden="true" /></Link></li>
                  <li><Link href="/dashboard">Dashboard <ArrowRight aria-hidden="true" /></Link></li>
                </ul>
              </div>
              <div>
                <h2>Legal</h2>
                <ul>
                  {/* These were href="#". A dead legal link is one of the things a
                      payment gateway reviewer records as a missing policy. */}
                  <li><Link href="/privacy-policy">Privacy Policy <ArrowRight aria-hidden="true" /></Link></li>
                  <li><Link href="/terms-of-service">Terms &amp; Conditions <ArrowRight aria-hidden="true" /></Link></li>
                  <li><Link href="/return-refund-cancellation">Refunds &amp; Cancellation <ArrowRight aria-hidden="true" /></Link></li>
                  <li><Link href="/disclaimer">Disclaimer <ArrowRight aria-hidden="true" /></Link></li>
                </ul>
              </div>
              <div>
                <h2>Support</h2>
                <ul>
                  <li><Link href="/contact-us">Contact us <ArrowRight aria-hidden="true" /></Link></li>
                  <li><Link href="/#main">Back to top <ArrowRight aria-hidden="true" /></Link></li>
                </ul>
                <p className="els-body" style={{ marginTop: "1.5rem", color: "rgb(255 255 255 / 0.6)", maxWidth: "28ch" }}>
                  Science is easier to understand when you can try it yourself.
                </p>
              </div>
            </div>

            <div className="els-footer-base els-body">
              <Link href="/" className="els-wordmark">
                <span className="els-wordmark-mark" aria-hidden="true">L</span>
                <span className="els-wordmark-text">Live Labs</span>
              </Link>
              <span>© {new Date().getFullYear()} Live Labs. All rights reserved.</span>
            </div>
          </div>
        </footer>
  );
}
