import L from "leaflet";

// Fix for webpack/React bundling issue
delete L.Icon.Default.prototype._getIconUrl;
L.Icon.Default.mergeOptions({
  iconRetinaUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon-2x.png",
  iconUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-icon.png",
  shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
});

// Example: Use your own CDN URLs for customer/retailer
const CUSTOMER_ICON_URL = "https://cdn-icons-png.flaticon.com/512/1077/1077114.png";
const RETAILER_ICON_URL = "https://cdn-icons-png.flaticon.com/512/1995/1995523.png";

export default function createAvatarIcon(user) {
  let iconUrl;
  if (user?.role === "customer") {
    iconUrl = CUSTOMER_ICON_URL;
  } else if (user?.role === "retailer") {
    iconUrl = RETAILER_ICON_URL;
  } else {
    // Fallback to Leaflet default
    return new L.Icon.Default();
  }
  return L.icon({
    iconUrl,
    shadowUrl: "https://unpkg.com/leaflet@1.9.3/dist/images/marker-shadow.png",
    iconSize: [32, 32],
    iconAnchor: [16, 32],
    popupAnchor: [1, -34],
    shadowAnchor: [12, 41],
    className: "avatar-marker",
  });
}
