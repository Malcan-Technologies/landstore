"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import { GoogleMap, InfoWindowF, MarkerF, useLoadScript } from "@react-google-maps/api";
import InfoWindowCard from "@/components/userDashboard/explore/InfoWindowCard";

const baseContainerClassName =
  "relative h-full min-h-135 w-full overflow-hidden rounded-xl border border-border-card bg-background-primary shadow-[0_15px_35px_rgba(15,61,46,0.05)]";

const mapOptions = {
  disableDefaultUI: true,
  clickableIcons: false,
  styles: [{ featureType: "poi", stylers: [{ visibility: "off" }] }],
};

const isFiniteLatLng = (value) => Number.isFinite(value?.lat) && Number.isFinite(value?.lng);

const defaultCenter = { lat: 4.2105, lng: 101.9758 }; // Malaysia

const toRadians = (value) => (value * Math.PI) / 180;

const getDistanceKm = (lat1, lng1, lat2, lng2) => {
  const earthRadiusKm = 6371;
  const dLat = toRadians(lat2 - lat1);
  const dLng = toRadians(lng2 - lng1);
  const a =
    Math.sin(dLat / 2) * Math.sin(dLat / 2) +
    Math.cos(toRadians(lat1)) * Math.cos(toRadians(lat2)) *
      Math.sin(dLng / 2) * Math.sin(dLng / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  return earthRadiusKm * c;
};

const getViewportPayload = (mapInstance) => {
  if (!mapInstance?.getCenter || !mapInstance?.getBounds) {
    return null;
  }

  const center = mapInstance.getCenter();
  const bounds = mapInstance.getBounds();

  if (!center || !bounds) {
    return null;
  }

  const northEast = bounds.getNorthEast();
  const southWest = bounds.getSouthWest();

  const centerLat = center.lat();
  const centerLng = center.lng();
  const north = northEast.lat();
  const east = northEast.lng();
  const south = southWest.lat();
  const west = southWest.lng();

  if (![centerLat, centerLng, north, east, south, west].every((value) => Number.isFinite(value))) {
    return null;
  }

  const cornerDistanceKm = getDistanceKm(centerLat, centerLng, north, east);
  const oppositeCornerDistanceKm = getDistanceKm(centerLat, centerLng, south, west);
  const radiusKm = Math.max(cornerDistanceKm, oppositeCornerDistanceKm, 0.1);

  return {
    center: { lat: centerLat, lng: centerLng },
    radiusKm,
    bounds: {
      north,
      east,
      south,
      west,
    },
  };
};

const baseMarkerSvg = (color) => `
  <svg width="36" height="36" viewBox="0 0 36 36" fill="none" xmlns="http://www.w3.org/2000/svg">
    <path d="M18 0C11.3726 0 6 5.37258 6 12C6 20.25 18 36 18 36C18 36 30 20.25 30 12C30 5.37258 24.6274 0 18 0Z" fill="${color}"/>
    <circle cx="18" cy="12" r="6" fill="white"/>
  </svg>`;

const getThemeColor = (variableName, fallback = "") => {
  if (typeof window === "undefined") return fallback;
  const value = getComputedStyle(document.documentElement).getPropertyValue(variableName).trim();
  return value || fallback;
};

const InfoWindowContent = ({ marker, showCenterRings, ringClassName }) => {
  return (
    <div className="relative">
      {showCenterRings ? (
        <div className={`pointer-events-none absolute left-1/2 top-1/2 flex -translate-x-1/2 -translate-y-1/2 items-center justify-center ${ringClassName}`.trim()}>
          <span className="absolute h-56 w-56 rounded-full border-[1.5px] border-dashed border-green-secondary/45 bg-green-logo/15" />
          <span className="absolute h-40 w-40 rounded-full  bg-green-logo/32" />
        </div>
      ) : null}

      <div className="relative z-10">
        <InfoWindowCard image={marker.image} price={marker.price} area={marker.area} category={marker.category} />
      </div>
    </div>
  );
};

const MapView = ({
  markers = [],
  center,
  zoom = 8,
  containerClassName = "",
  mapClassName = "h-full w-full",
  showCenterRings = false,
  ringClassName = "",
  defaultActiveMarkerId = null,
  infoWindowOffset = 13,
  markerColor,
  hideMarkerPin = false,
  onMapClick,
  onViewportChange,
}) => {
  const [activeMarker, setActiveMarker] = useState(defaultActiveMarkerId);
  const mapRef = useRef(null);
  const { isLoaded, loadError } = useLoadScript({
    googleMapsApiKey: process.env.NEXT_PUBLIC_GOOGLE_MAPS_API_KEY ?? "",
  });

  useEffect(() => {
    setActiveMarker(defaultActiveMarkerId);
  }, [defaultActiveMarkerId]);

  const combinedContainerClassName = `${baseContainerClassName} ${containerClassName}`.trim();

  const validMarkers = useMemo(
    () => markers.filter((marker) => isFinite(marker?.lat) && isFinite(marker?.lng)),
    [markers]
  );

  const activeMarkerData = useMemo(
    () => validMarkers.find((marker) => marker.id === activeMarker) ?? null,
    [activeMarker, validMarkers]
  );

  const resolvedMarkerColor = useMemo(
    () => markerColor || getThemeColor("--color-green-secondary", "var(--color-green-secondary)"),
    [markerColor]
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

  const handleMapClick = useCallback(
    (event) => {
      if (!onMapClick) {
        return;
      }

      const lat = event.latLng?.lat?.();
      const lng = event.latLng?.lng?.();

      if (!Number.isFinite(lat) || !Number.isFinite(lng)) {
        return;
      }

      onMapClick({ lat, lng });
    },
    [onMapClick]
  );

  const emitViewportChange = useCallback(() => {
    if (!onViewportChange || !mapRef.current) {
      return;
    }

    const viewportPayload = getViewportPayload(mapRef.current);
    if (!viewportPayload) {
      return;
    }

    onViewportChange(viewportPayload);
  }, [onViewportChange]);

  const handleMapLoad = useCallback(
    (mapInstance) => {
      mapRef.current = mapInstance;
      emitViewportChange();
    },
    [emitViewportChange]
  );

  const handleMapUnmount = useCallback(() => {
    mapRef.current = null;
  }, []);

  const handleMapIdle = useCallback(() => {
    emitViewportChange();
  }, [emitViewportChange]);

  const infoWindowOptions = useMemo(() => {
    if (typeof window === "undefined" || !window.google) return undefined;
    return {
      pixelOffset: new window.google.maps.Size(0, infoWindowOffset),
    };
  }, [infoWindowOffset]);

  if (loadError) {
    return (
      <div className={`${combinedContainerClassName} flex items-center justify-center text-sm text-gray5`}>
        Unable to load Google Maps. Please verify your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className={`${combinedContainerClassName} animate-pulse bg-background-primary`}>
        <span className="sr-only">Loading map...</span>
      </div>
    );
  }

  return (
    <div className={combinedContainerClassName}>
      <GoogleMap
        mapContainerClassName={mapClassName}
        center={safeCenter}
        zoom={zoom}
        options={mapOptions}
        onLoad={handleMapLoad}
        onUnmount={handleMapUnmount}
        onIdle={handleMapIdle}
        onClick={handleMapClick}
      >
        {validMarkers.map((marker) => (
          hideMarkerPin ? (
            activeMarker === marker.id && activeMarkerData ? (
              <InfoWindowF
                key={marker.id}
                position={{ lat: activeMarkerData.lat, lng: activeMarkerData.lng }}
                onCloseClick={() => setActiveMarker(null)}
                options={infoWindowOptions}
              >
                <InfoWindowContent marker={marker} showCenterRings={showCenterRings} ringClassName={ringClassName} />
              </InfoWindowF>
            ) : null
          ) : (
            <MarkerF
              key={marker.id}
              position={{ lat: marker.lat, lng: marker.lng }}
              onClick={() => handleMarkerClick(marker.id)}
              icon={{
                url: "data:image/svg+xml;charset=UTF-8," + encodeURIComponent(baseMarkerSvg(resolvedMarkerColor)),
                scaledSize: new window.google.maps.Size(36, 36),
              }}
            >
              {activeMarker === marker.id && activeMarkerData ? (
                <InfoWindowF
                  position={{ lat: activeMarkerData.lat, lng: activeMarkerData.lng }}
                  onCloseClick={() => setActiveMarker(null)}
                  options={infoWindowOptions}
                >
                  <InfoWindowContent marker={marker} showCenterRings={showCenterRings} ringClassName={ringClassName} />
                </InfoWindowF>
              ) : null}
            </MarkerF>
          )
        ))}
      </GoogleMap>
    </div>
  );
};

export default MapView;
