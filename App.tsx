import React, { useState, useEffect } from "react";
import { StyleSheet, View, Text, TextInput, TouchableOpacity, Keyboard, Alert } from "react-native";
import MapView, { Marker, UrlTile, Polyline, MapPressEvent } from "react-native-maps";
import * as Location from "expo-location";

export default function App() {
  const [region, setRegion] = useState({
    latitude: -25.9655,
    longitude: 32.5892,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [currentLocation, setCurrentLocation] = useState<{ latitude: number; longitude: number } | null>(null);
  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [addedMarkers, setAddedMarkers] = useState<{ latitude: number; longitude: number }[]>([]);
  const [searchText, setSearchText] = useState("");
  const [selectedMarker, setSelectedMarker] = useState<{ latitude: number; longitude: number } | null>(null);

  // Get user location
  useEffect(() => {
    (async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== "granted") {
        Alert.alert("Permission denied", "Allow location access to use routing.");
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setCurrentLocation({
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });

      setRegion({
        ...region,
        latitude: location.coords.latitude,
        longitude: location.coords.longitude,
      });
    })();
  }, []);

  const handleSearch = async () => {
    if (!searchText) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}`,
        { headers: { "User-Agent": "MyExpoApp/1.0 (example@example.com)" } }
      );
      const data = await response.json();

      if (data.length > 0) {
        const firstResult = data[0];
        const lat = parseFloat(firstResult.lat);
        const lon = parseFloat(firstResult.lon);

        setRegion({ ...region, latitude: lat, longitude: lon });
        setMarker({ latitude: lat, longitude: lon });
        Keyboard.dismiss();
      } else {
        alert("Location not found");
      }
    } catch (error) {
      console.error(error);
      alert("Error fetching location");
    }
  };

  const handleAddMarker = () => {
    setAddedMarkers([...addedMarkers, { latitude: region.latitude, longitude: region.longitude }]);
  };

  const handleMapPress = (e: MapPressEvent) => {
    const coord = e.nativeEvent.coordinate;
    setAddedMarkers([...addedMarkers, coord]);
  };

  // Tap on marker → show route
  const handleMarkerPress = (coord: { latitude: number; longitude: number }) => {
    setSelectedMarker(coord);
    setRegion({ ...region, latitude: coord.latitude, longitude: coord.longitude });
  };

  return (
    <View style={styles.container}>
      {/* Search Bar */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search city or location"
          placeholderTextColor="#888"
          value={searchText}
          onChangeText={setSearchText}
        />
        <TouchableOpacity style={styles.searchButton} onPress={handleSearch}>
          <Text style={styles.buttonText}>Search</Text>
        </TouchableOpacity>
      </View>

      {/* Add Marker Button */}
      <TouchableOpacity style={styles.addMarkerButton} onPress={handleAddMarker}>
        <Text style={styles.addMarkerText}>＋ Add Marker</Text>
      </TouchableOpacity>

      {/* Map */}
      <MapView
        style={styles.map}
        region={region}
        onRegionChangeComplete={(r) => setRegion(r)}
        onPress={handleMapPress}
      >
        {/* Carto Voyager raster tiles */}
        <UrlTile
          urlTemplate="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
          maximumZ={19}
        />

        {/* Markers */}
        {marker && (
          <Marker
            coordinate={marker}
            title={searchText}
            description="Searched location"
            pinColor="#2ecc71"
            onPress={() => handleMarkerPress(marker)}
          />
        )}
        {currentLocation && <Marker coordinate={currentLocation} title="You are here" pinColor="#3498db" />}
        {addedMarkers.map((m, i) => (
          <Marker
            key={i}
            coordinate={m}
            title={`Marker ${i + 1}`}
            pinColor="#e74c3c"
            onPress={() => handleMarkerPress(m)}
          />
        ))}

        {/* Route to selected marker */}
        {currentLocation && selectedMarker && (
          <Polyline coordinates={[currentLocation, selectedMarker]} strokeColor="#f39c12" strokeWidth={4} />
        )}
      </MapView>

      {/* OSM Attribution */}
      <View style={styles.attribution}>
        <Text style={{ fontSize: 12, color: "#555" }}>© OpenStreetMap contributors</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#f0f0f0" },
  map: { flex: 1 },
  attribution: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.85)",
    padding: 6,
    borderRadius: 6,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 3,
  },
  searchContainer: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    zIndex: 10,
    flexDirection: "row",
    backgroundColor: "#fff",
    borderRadius: 12,
    padding: 5,
    shadowColor: "#000",
    shadowOpacity: 0.2,
    shadowRadius: 5,
    elevation: 5,
  },
  input: {
    flex: 1,
    padding: 10,
    borderRadius: 10,
    borderColor: "#ddd",
    borderWidth: 1,
    marginRight: 8,
    fontSize: 16,
    color: "#333",
  },
  searchButton: {
    backgroundColor: "#3498db",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 10,
    justifyContent: "center",
  },
  buttonText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
  addMarkerButton: {
    position: "absolute",
    top: 100,
    left: 10,
    zIndex: 10,
    backgroundColor: "#e74c3c",
    paddingVertical: 10,
    paddingHorizontal: 15,
    borderRadius: 12,
    shadowColor: "#000",
    shadowOpacity: 0.3,
    shadowRadius: 5,
    elevation: 5,
  },
  addMarkerText: { color: "#fff", fontWeight: "bold", fontSize: 16 },
});
