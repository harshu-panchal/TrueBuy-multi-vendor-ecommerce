import React, { useState, useEffect, useCallback } from 'react';
import { GoogleMap, useJsApiLoader, DirectionsRenderer } from '@react-google-maps/api';
import { FiMapPin, FiClock, FiMap } from 'react-icons/fi';

const containerStyle = {
  width: '100%',
  height: '400px',
  borderRadius: '0.75rem',
};

// Default center (India)
const defaultCenter = {
  lat: 20.5937,
  lng: 78.9629,
};

const libraries = ['places'];

const RoutePreviewMap = ({ origin, waypoint, destination, onRouteCalculated, hideInternalUI }) => {
  const { isLoaded, loadError } = useJsApiLoader({
    id: 'google-map-script',
    googleMapsApiKey: import.meta.env.VITE_GOOGLE_MAPS_API_KEY || '',
    libraries,
  });

  const [directions, setDirections] = useState(null);
  const [distance, setDistance] = useState('');
  const [duration, setDuration] = useState('');
  const [error, setError] = useState('');

  const calculateRoute = useCallback(() => {
    if (!destination || !window.google) return;
    if (!origin && !waypoint) return;

    const directionsService = new window.google.maps.DirectionsService();

    const request = {
      origin: origin || waypoint,
      destination: destination,
      travelMode: window.google.maps.TravelMode.DRIVING,
    };

    if (origin && origin !== waypoint) {
      request.waypoints = [
        {
          location: waypoint,
          stopover: true,
        },
      ];
    }

    directionsService.route(
      request,
      (result, status) => {
        if (status === window.google.maps.DirectionsStatus.OK) {
          setDirections(result);
          
          // Calculate total distance and duration across all legs
          let totalDistance = 0;
          let totalDuration = 0;
          
          const legs = result.routes[0].legs;
          for (let i = 0; i < legs.length; ++i) {
            totalDistance += legs[i].distance.value;
            totalDuration += legs[i].duration.value;
          }
          
          setDistance((totalDistance / 1000).toFixed(2) + ' km');
          
          // Convert seconds to readable format
          const hrs = Math.floor(totalDuration / 3600);
          const mins = Math.floor((totalDuration % 3600) / 60);
          
          let durationStr = '';
          if (hrs > 0) durationStr += `${hrs} hr `;
          durationStr += `${mins} mins`;
          setDuration(durationStr);
          setError('');
          if (onRouteCalculated) {
             onRouteCalculated({
                distance: (totalDistance / 1000).toFixed(1) + ' km',
                duration: durationStr
             });
          }
        } else {
          console.error(`Error fetching directions: ${status}`);
          setError('Could not calculate route. Addresses might be invalid.');
        }
      }
    );
  }, [origin, waypoint, destination, onRouteCalculated]);

  useEffect(() => {
    if (isLoaded) {
      calculateRoute();
    }
  }, [isLoaded, calculateRoute]);

  if (loadError) {
    return (
      <div className="bg-red-50 text-red-600 p-4 rounded-xl flex items-center justify-center">
        Error loading maps. Check your API key.
      </div>
    );
  }

  if (!isLoaded) {
    return (
      <div className="bg-gray-100 h-[400px] rounded-xl flex items-center justify-center animate-pulse">
        <span className="text-gray-500">Loading map...</span>
      </div>
    );
  }

  return (
    <div className={`space-y-4 ${hideInternalUI ? 'h-full w-full' : ''}`}>
      {!hideInternalUI && (distance || duration) && (
        <div className="flex flex-wrap items-center gap-4 bg-primary-50 p-4 rounded-xl border border-primary-100">
          <div className="flex items-center gap-2 text-primary-700 font-semibold">
            <FiMap className="text-xl" />
            <span>Total Route:</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-primary-100">
            <FiMapPin className="text-gray-500" />
            <span className="text-gray-800 font-medium">{distance}</span>
          </div>
          <div className="flex items-center gap-2 bg-white px-3 py-1.5 rounded-lg shadow-sm border border-primary-100">
            <FiClock className="text-gray-500" />
            <span className="text-gray-800 font-medium">{duration}</span>
          </div>
        </div>
      )}
      
      {!hideInternalUI && error && (
        <div className="bg-red-50 text-red-600 p-3 rounded-lg text-sm border border-red-200">
          {error}
        </div>
      )}

      <div className={`relative ${hideInternalUI ? 'h-full w-full' : 'border rounded-xl overflow-hidden shadow-sm'}`}>
        <GoogleMap
          mapContainerStyle={hideInternalUI ? { width: '100%', height: '100%' } : containerStyle}
          center={defaultCenter}
          zoom={5}
          options={{
            disableDefaultUI: false,
            zoomControl: true,
          }}
        >
          {directions && (
            <DirectionsRenderer
              directions={directions}
              options={{
                suppressMarkers: false,
                polylineOptions: {
                  strokeColor: '#10B981',
                  strokeWeight: 5,
                },
              }}
            />
          )}
        </GoogleMap>
      </div>
    </div>
  );
};

export default RoutePreviewMap;
