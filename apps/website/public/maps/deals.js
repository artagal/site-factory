/* Public, read-only map. Native FlutterFlow owns filters and offer-detail navigation. */
(() => {
  const status = document.getElementById("status");
  const retry = document.getElementById("retry");
  const query = new URLSearchParams(location.search);
  const catalog = query.get("catalog") === "examples" ? "examples" : "live";
  const cityId = query.get("cityId") || "";
  if (!window.L) { status.textContent = "Map unavailable. Use the offer list below."; return; }
  const map = L.map("map", { scrollWheelZoom: true }).setView([39.5, -98.35], 4);
  const tiles = L.tileLayer("https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png", {
    maxZoom: 19, attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a>'
  }).addTo(map);
  tiles.on("tileerror", () => { status.textContent = "Map tiles could not load. Your offer list is still available."; });
  const markers = L.layerGroup().addTo(map);
  map.on("popupopen", () => { status.hidden = true; });
  map.on("popupclose", () => { status.hidden = false; });
  function text(tag, value, className) {
    const element = document.createElement(tag);
    element.textContent = value;
    if (className) element.className = className;
    return element;
  }
  async function load() {
    retry.hidden = true;
    status.textContent = "Loading activity locations...";
    try {
      const response = await fetch(`/api/mobile/discovery?${new URLSearchParams({ catalog, cityId })}`, { cache: "no-store", signal: AbortSignal.timeout(15000) });
      if (!response.ok) throw new Error("unavailable");
      const data = await response.json();
      const offers = data.cards.filter((offer) => offer.hasLocation && Number.isFinite(offer.latitude) && Number.isFinite(offer.longitude));
      markers.clearLayers();
      const venues = new Map();
      for (const offer of offers) {
        const key = `${offer.latitude},${offer.longitude}`;
        venues.set(key, [...(venues.get(key) || []), offer]);
      }
      for (const venueOffers of venues.values()) {
        const offer = venueOffers[0];
        const pin = text("div", venueOffers.length > 1 ? `${venueOffers.length} offers` : offer.priceLabel, `price-pin${offer.isDemo ? " example" : ""}`);
        const icon = L.divIcon({ html: pin, className: "", iconSize: [72, 36], iconAnchor: [36, 36] });
        const popup = document.createElement("div");
        for (const offer of venueOffers) {
          const card = document.createElement("article");
          card.append(text("span", offer.isDemo ? "Example / not bookable" : offer.discountLabel || "Open spot", "offer-badge"),
            text("h2", offer.title));
          const price = text("p", "");
          price.append(text("span", offer.priceLabel, "offer-price"), text("span", offer.wasLabel, "offer-was"));
          card.append(price, text("p", offer.timeLabel), text("p", offer.spotsLabel));
          if (!offer.isDemo && typeof offer.detailUrl === "string" && offer.detailUrl.startsWith("/deals/")) {
            const link = text("a", "View deal", "offer-action");
            link.href = offer.detailUrl;
            link.target = "_blank";
            link.rel = "noopener";
            card.append(link);
          }
          popup.append(card);
        }
        L.marker([offer.latitude, offer.longitude], { icon, alt: `${offer.title}, ${offer.priceLabel}`, keyboard: true })
          .bindPopup(popup, { maxWidth: 260, maxHeight: Math.max(120, Math.min(250, window.innerHeight - 100)), autoPanPadding: [12, 24] }).addTo(markers);
      }
      if (offers.length) map.fitBounds(offers.map((offer) => [offer.latitude, offer.longitude]), { padding: [48, 56], maxZoom: 13 });
      status.textContent = offers.length
        ? `${offers.length} ${catalog === "examples" ? "example offers. Not bookable." : "offers on the map. Tap a price."}`
        : "No live locations yet. Explore examples or try another city.";
    } catch {
      status.textContent = "Locations could not load. Retry or use the offer list.";
      retry.hidden = false;
    }
  }
  retry.addEventListener("click", load);
  load();
})();
