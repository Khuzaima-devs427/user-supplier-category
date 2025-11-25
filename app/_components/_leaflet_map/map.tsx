'use client';

import { useEffect, useRef, useState } from 'react';

interface Address {
  country?: string;
  state?: string;
  city?: string;
  streetAddress?: string;
  houseNumber?: string;
  postalCode?: string;
  latitude?: number;
  longitude?: number;
}

interface LeafletMapProps {
  onLocationSelect?: (address: Address) => void;
  initialAddress?: Address;
}

const LeafletMap: React.FC<LeafletMapProps> = ({ onLocationSelect, initialAddress }) => {
  const mapRef = useRef<HTMLDivElement>(null);
  const searchRef = useRef<HTMLInputElement>(null);
  const suggestionsRef = useRef<HTMLDivElement>(null);
  const mapInstanceRef = useRef<any>(null);
  const markerRef = useRef<any>(null);
  const [searchQuery, setSearchQuery] = useState('');
  const [suggestions, setSuggestions] = useState<any[]>([]);
  const [showSuggestions, setShowSuggestions] = useState(false);
  const [isSearching, setIsSearching] = useState(false);

  useEffect(() => {
    const loadCSS = (href: string) => {
      const link = document.createElement('link');
      link.rel = 'stylesheet';
      link.href = href;
      document.head.appendChild(link);
      return link;
    };

    const leafletCSS = loadCSS('https://unpkg.com/leaflet@1.9.4/dist/leaflet.css');

    const initMap = async () => {
      try {
        const L = await import('leaflet');

        delete (L.Icon.Default.prototype as any)._getIconUrl;
        L.Icon.Default.mergeOptions({
          iconRetinaUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon-2x.png',
          iconUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-icon.png',
          shadowUrl: 'https://cdnjs.cloudflare.com/ajax/libs/leaflet/1.7.1/images/marker-shadow.png',
        });

        if (!mapRef.current) return;

        const map = L.map(mapRef.current);
        
        const initialLat = initialAddress?.latitude || 51.505;
        const initialLng = initialAddress?.longitude || -0.09;
        
        map.setView([initialLat, initialLng], 13);
        
        // Add initial marker if coordinates are available
        if (initialAddress?.latitude && initialAddress?.longitude) {
          markerRef.current = L.marker([initialAddress.latitude, initialAddress.longitude])
            .addTo(map)
            .bindPopup('Selected Location')
            .openPopup();
        } else {
          // Add default marker at initial position
          markerRef.current = L.marker([initialLat, initialLng])
            .addTo(map)
            .bindPopup('Selected Location')
            .openPopup();
        }

        setTimeout(() => {
          map.invalidateSize();
        }, 100);

        L.tileLayer('https://tile.openstreetmap.org/{z}/{x}/{y}.png', {
          maxZoom: 19,
          attribution: '&copy; <a href="http://www.openstreetmap.org/copyright">OpenStreetMap</a>'
        }).addTo(map);

        map.on('click', (e: any) => {
          const { lat, lng } = e.latlng;
          handleMapClick(lat, lng, L, map);
        });

        mapInstanceRef.current = map;

      } catch (error) {
        console.error('Error loading Leaflet:', error);
      }
    };

    initMap();

    return () => {
      if (mapInstanceRef.current) {
        mapInstanceRef.current.remove();
      }
    };
  }, [initialAddress]);

  useEffect(() => {
    if (searchQuery.length > 2) {
      fetchSuggestions(searchQuery);
    } else {
      setSuggestions([]);
      setShowSuggestions(false);
    }
  }, [searchQuery]);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (suggestionsRef.current && !suggestionsRef.current.contains(event.target as Node) &&
          searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSuggestions(false);
      }
    };

    document.addEventListener('mousedown', handleClickOutside);
    return () => document.removeEventListener('mousedown', handleClickOutside);
  }, []);

  const fetchSuggestions = async (query: string) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(query)}&limit=5`
      );
      const results = await response.json();
      setSuggestions(results);
      setShowSuggestions(true);
    } catch (error) {
      console.error('Error fetching suggestions:', error);
    }
  };

  const clearMarkers = () => {
    if (mapInstanceRef.current && markerRef.current) {
      mapInstanceRef.current.removeLayer(markerRef.current);
      markerRef.current = null;
    }
  };

  const addMarker = (lat: number, lng: number, L: any, popupText: string = 'Selected Location', draggable: boolean = true) => {
    clearMarkers();
    
    markerRef.current = L.marker([lat, lng], { draggable })
      .addTo(mapInstanceRef.current)
      .bindPopup(popupText)
      .openPopup();

    if (draggable) {
      markerRef.current.on('dragend', (event: any) => {
        const marker = event.target;
        const position = marker.getLatLng();
        reverseGeocode(position.lat, position.lng);
      });
    }

    return markerRef.current;
  };

  const handleMapClick = async (lat: number, lng: number, L: any, map: any) => {
    addMarker(lat, lng, L, 'Selected Location<br>Drag to move', true);
    reverseGeocode(lat, lng);
  };

  const reverseGeocode = async (lat: number, lng: number) => {
    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/reverse?format=json&lat=${lat}&lon=${lng}&zoom=18&addressdetails=1`
      );
      const result = await response.json();

      if (result && result.address) {
        const address: Address = {
          latitude: lat,
          longitude: lng,
          country: result.address.country,
          state: result.address.state || result.address.region,
          city: result.address.city || result.address.town || result.address.village,
          streetAddress: result.address.road || result.address.street,
          houseNumber: result.address.house_number,
          postalCode: result.address.postcode,
        };

        console.log('Address to send:', address);
        
        // Call the callback to update parent form
        if (onLocationSelect) {
          onLocationSelect(address);
        }
      }
    } catch (error) {
      console.error('Reverse geocoding error:', error);
    }
  };

  const handleSearch = async () => {
    if (!searchQuery.trim() || !mapInstanceRef.current) return;

    setIsSearching(true);
    try {
      const L = await import('leaflet');
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchQuery)}&limit=1`
      );
      const results = await response.json();

      if (results && results.length > 0) {
        const result = results[0];
        const lat = parseFloat(result.lat);
        const lng = parseFloat(result.lon);
        
        mapInstanceRef.current.setView([lat, lng], 16);
        
        // Add marker for search result
        addMarker(lat, lng, L, `<b>${result.display_name}</b>`, true);

        // Trigger reverse geocoding to get address details
        reverseGeocode(lat, lng);
        setShowSuggestions(false);
      } else {
        alert('Location not found. Please try a different search term.');
      }
    } catch (error) {
      console.error('Search error:', error);
      alert('Search failed. Please try again.');
    } finally {
      setIsSearching(false);
    }
  };

  const handleSuggestionClick = async (suggestion: any) => {
    setSearchQuery(suggestion.display_name);
    setShowSuggestions(false);
    
    if (mapInstanceRef.current) {
      try {
        const L = await import('leaflet');
        const lat = parseFloat(suggestion.lat);
        const lng = parseFloat(suggestion.lon);
        
        mapInstanceRef.current.setView([lat, lng], 16);
        
        // Add marker for suggestion
        addMarker(lat, lng, L, `<b>${suggestion.display_name}</b>`, true);

        // Trigger reverse geocoding to get address details
        reverseGeocode(lat, lng);
      } catch (error) {
        console.error('Error handling suggestion:', error);
      }
    }
  };

  const handleKeyPress = (e: React.KeyboardEvent) => {
    if (e.key === 'Enter') {
      e.preventDefault();
      handleSearch();
    }
  };

  return (
    <div className="mt-4">
      {/* Search Bar */}
      <div className="mb-4 relative">
        <div className="flex gap-2">
          <div className="flex-1 relative">
            <input
              ref={searchRef}
              type="text"
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
              onKeyPress={handleKeyPress}
              onFocus={() => setShowSuggestions(suggestions.length > 0)}
              placeholder="Search for locations, addresses, or landmarks..."
              className="w-full px-3 py-2 border border-gray-300 rounded-md shadow-sm focus:outline-none focus:ring-blue-500 focus:border-blue-500 sm:text-sm"
            />
            
            {showSuggestions && suggestions.length > 0 && (
              <div 
                ref={suggestionsRef}
                className="absolute z-1000 w-full mt-1 bg-white border border-gray-300 rounded-md shadow-lg max-h-60 overflow-y-auto"
              >
                {suggestions.map((suggestion, index) => (
                  <div
                    key={index}
                    className="px-3 py-2 cursor-pointer hover:bg-blue-50 border-b border-gray-100 last:border-b-0"
                    onClick={() => handleSuggestionClick(suggestion)}
                  >
                    <div className="text-sm font-medium text-gray-900">
                      {suggestion.display_name}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
          <button
            type="button"
            onClick={handleSearch}
            disabled={isSearching}
            className="px-4 py-2 bg-blue-600 text-white rounded-md hover:bg-blue-700 focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transition-colors disabled:opacity-50 disabled:cursor-not-allowed"
          >
            {isSearching ? 'Searching...' : 'Search'}
          </button>
        </div>
      </div>



      {/* Map Container */}
      <div 
        ref={mapRef} 
        style={{ 
          height: '400px', 
          width: '100%',
          borderRadius: '8px',
          overflow: 'hidden',
        }}
        className="border border-gray-300 bg-gray-100"
      />
    </div>
    
  );
};

export default LeafletMap;