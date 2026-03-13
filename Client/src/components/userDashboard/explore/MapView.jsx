"use client";

import { useCallback, useMemo, useState } from "react";
import { GoogleMap, InfoWindowF, MarkerF, useLoadScript } from "@react-google-maps/api";
import InfoWindowCard from "@/components/userDashboard/explore/InfoWindowCard";

const containerClassName =
  "relative h-full min-h-135 w-full overflow-hidden rounded-3xl border border-[#E6EBF2] bg-[#F8F8F8] shadow-[0_15px_35px_rgba(15,61,46,0.05)]";

const mapOptions = {
  disableDefaultUI: true,
  clickableIcons: false,
  styles: [
    {
      featureType: "all",
      elementType: "geometry",
      stylers: [{ color: "#f5f5f5" }],
    },
    {
      featureType: "poi",
      stylers: [{ visibility: "off" }],
    },
    {
      featureType: "road",
      elementType: "geometry",
      stylers: [{ color: "#ffffff" }],
    },
    {
      featureType: "water",
      stylers: [{ color: "#d4e8ff" }],
    },
  ],
};

const isFiniteLatLng = (value) => Number.isFinite(value?.lat) && Number.isFinite(value?.lng);

const defaultCenter = { lat: 4.2105, lng: 101.9758 }; // Malaysia

const MapView = ({ markers = [], center, zoom = 8 }) => {
  const [activeMarker, setActiveMarker] = useState(null);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  const validMarkers = useMemo(
    () => markers.filter((marker) => isFinite(marker?.lat) && isFinite(marker?.lng)),
    [markers]
  );

  const safeCenter = useMemo(() => {
    if (center && isFiniteLatLng(center)) return center;
    if (validMarkers.length) {
      const [first] = validMarkers;
      return { lat: first.lat, lng: first.lng };
    }
    return defaultCenter;
  }, [center, validMarkers]);

  const handleMarkerClick = useCallback((markerId) => {
    setActiveMarker((prev) => (prev === markerId ? null : markerId));
  }, []);

  const infoWindowOptions = useMemo(() => {
    if (typeof window === "undefined" || !window.google) return undefined;
    return {
      pixelOffset: new window.google.maps.Size(0, 13),
    };
  }, [isLoaded]);

  if (loadError) {
    return (
      <div className={`${containerClassName} flex items-center justify-center text-sm text-[#5F6C7B]`}>
        Unable to load Google Maps. Please verify your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`${containerClassName} animate-pulse bg-gradient-to-br from-[#f5f8f6] to-[#e9f3ef]`}>
        <span className="sr-only">Loading map...</span>
      </div>
    );
  }

  return (
    <GoogleMap
      mapContainerClassName={containerClassName}
      center={safeCenter}
      zoom={zoom}
      options={mapOptions}
    >
      {validMarkers.map((marker) => (
        <MarkerF
          key={marker.id}
          position={{ lat: marker.lat, lng: marker.lng }}
          onClick={() => handleMarkerClick(marker.id)}
          icon={{
            url:
              "data:image/svg+xml;charset=UTF-8," +
              encodeURIComponent(`
                <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
                  <path d="M18 0C11.3726 0 6 5.37258 6 12C6 20.25 18 36 18 36C18 36 30 20.25 30 12C30 5.37258 24.6274 0 18 0Z" fill="#0F3D2E"/>
                  <circle cx="18" cy="12" r="6" fill="white"/>
                </svg>`),
            scaledSize: new window.google.maps.Size(36, 36),
          }}
        >
          {activeMarker === marker.id ? (
            <InfoWindowF onCloseClick={() => setActiveMarker(null)} options={infoWindowOptions}>
              <InfoWindowCard
                image={marker.image}
                price={marker.price}
                area={marker.area}
                category={marker.category}
              />
            </InfoWindowF>
          ) : null}
        </MarkerF>
      ))}
    </GoogleMap>
  );
};

export default MapView;
