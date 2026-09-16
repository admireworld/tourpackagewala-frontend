/* ================================================================
   REAL GOOGLE REVIEWS — homepage grid, right below #homeFeatured
   Paste this at the very END of script.js.

   Reads GET {API_BASE_URL}/api/reviews and renders:
     "4.9/5 based on 216 reviews on Google"
     + a responsive grid of review cards (photo, name, stars, time, text)

   Pure vanilla JS + inline styles — no library, no HTML/CSS edits needed.
================================================================ */

/* ---------- helper: simple GET ----------
   NOTE: script.js already defines an identical apiGet() further up.
   Keeping this one is harmless (same behaviour, later declaration wins),
   but you can safely delete these 6 lines if you don't want a duplicate. */
async function apiGet(path){
  const res = await fetch(`${API_BASE_URL}${path}`);
  const data = await res.json().catch(() => ({}));
  if(!res.ok) throw new Error(data.error || "Something went wrong.");
  return data;
}

/* ---------- small formatting helpers ---------- */
function rgStars(rating){
  const r = Math.max(0, Math.min(5, Math.round(Number(rating) || 0)));
  return "★".repeat(r) + "☆".repeat(5 - r);
}

function rgEscape(str){
  return String(str == null ? "" : str)
    .replace(/&/g, "&amp;").replace(/</g, "&lt;").replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;");
}

/* Review time — works whether the API sends relativeTime, time, or a
   unix/ISO timestamp. Returns "" if nothing usable is present. */
function rgTimeLabel(r){
  if(r.relativeTime) return r.relativeTime;
  if(r.relative_time_description) return r.relative_time_description;
  if(r.time && typeof r.time === "string") return r.time;
  const ts = r.time || r.timestamp || r.createdAt;
  if(!ts) return "";
  const d = new Date(typeof ts === "number" ? (ts < 1e12 ? ts * 1000 : ts) : ts);
  return isNaN(d) ? "" : d.toLocaleDateString("en-IN", { month: "short", year: "numeric" });
}

/* Photo if the API gives one, otherwise a coloured initial circle. */
function rgAvatarHTML(r){
  const name = r.author || r.author_name || r.name || "Google user";
  const photo = r.photo || r.profilePhotoUrl || r.profile_photo_url || r.avatar;
  if(photo){
    return `<img src="${rgEscape(photo)}" alt="${rgEscape(name)}" loading="lazy"
      style="width:44px;height:44px;border-radius:50%;object-fit:cover;flex:0 0 44px;background:#e8ecf5;">`;
  }
  return `<div style="width:44px;height:44px;border-radius:50%;flex:0 0 44px;background:#2B3968;color:#fff;
    display:flex;align-items:center;justify-content:center;font-weight:700;font-size:1.05rem;">
    ${rgEscape(name.trim().charAt(0).toUpperCase() || "?")}</div>`;
}

function rgReviewCardHTML(r){
  const name = r.author || r.author_name || r.name || "Google user";
  const text = r.text || r.review || "";
  const time = rgTimeLabel(r);
  return `
  <div style="background:#fff;border:1px solid #e6e9f0;border-radius:14px;padding:18px;
    box-shadow:0 2px 10px rgba(20,30,60,0.05);display:flex;flex-direction:column;gap:10px;">
    <div style="display:flex;align-items:center;gap:12px;">
      ${rgAvatarHTML(r)}
      <div style="min-width:0;">
        <div style="font-weight:600;color:#1b2440;white-space:nowrap;overflow:hidden;text-overflow:ellipsis;">
          ${rgEscape(name)}
        </div>
        <div style="display:flex;align-items:center;gap:8px;font-size:0.82rem;">
          <span style="color:#E3A23E;letter-spacing:1px;">${rgStars(r.rating)}</span>
          ${time ? `<span style="color:#8a90a2;">${rgEscape(time)}</span>` : ""}
        </div>
      </div>
    </div>
    <p style="margin:0;color:#4a5068;font-size:0.9rem;line-height:1.55;">${rgEscape(text)}</p>
  </div>`;
}

/* ---------- main ---------- */
async function loadRealGoogleReviews(){
  const anchor = document.getElementById("homeFeatured");
  if(!anchor) return; // not on the home page

  // Create the section once, directly after #homeFeatured.
  let box = document.getElementById("realGoogleReviews");
  if(!box){
    box = document.createElement("section");
    box.id = "realGoogleReviews";
    box.style.cssText = "max-width:1140px;margin:36px auto;padding:0 18px;";
    anchor.insertAdjacentElement("afterend", box);
  }
  box.innerHTML = `<p style="color:#8a90a2;font-size:0.9rem;">Loading reviews…</p>`;

  try{
    const data = await apiGet("/api/reviews");
    const biz = data.business || data;
    const rating = Number(biz.rating || 0);
    const total = Number(biz.totalReviews || biz.total || 0);
    const reviews = (data.reviews || []).slice(0, 6);

    box.innerHTML = `
      <div style="text-align:center;margin-bottom:22px;">
        <h2 style="margin:0 0 8px;font-size:1.6rem;color:#1b2440;">What our travellers say</h2>
        <div style="display:inline-flex;align-items:center;gap:10px;flex-wrap:wrap;justify-content:center;
          background:#f5f7fc;border:1px solid #e6e9f0;border-radius:999px;padding:8px 18px;">
          <span style="font-size:1.25rem;font-weight:700;color:#1b2440;">${rating.toFixed(1)}</span>
          <span style="color:#E3A23E;letter-spacing:2px;font-size:1.05rem;">${rgStars(rating)}</span>
          <span style="color:#4a5068;font-size:0.9rem;">
            ${rating.toFixed(1)}/5 based on ${total} reviews on Google
          </span>
        </div>
      </div>
      <div style="display:grid;gap:16px;grid-template-columns:repeat(auto-fit,minmax(260px,1fr));">
        ${reviews.map(rgReviewCardHTML).join("") ||
          `<p style="color:#8a90a2;">No reviews yet.</p>`}
      </div>`;
  }catch(err){
    console.error("Could not load Google reviews:", err);
    box.innerHTML = ""; // fail silently instead of showing a broken section
  }
}

loadRealGoogleReviews();
