import React, { useState } from "react";
import { StyleSheet, View, Text, TextInput, Button, Keyboard } from "react-native";
import MapView, { Marker, UrlTile } from "react-native-maps";

export default function App() {
  const [region, setRegion] = useState({
    latitude: -25.9655,
    longitude: 32.5892,
    latitudeDelta: 0.05,
    longitudeDelta: 0.05,
  });

  const [marker, setMarker] = useState<{ latitude: number; longitude: number } | null>(null);
  const [searchText, setSearchText] = useState("");

  const handleSearch = async () => {
    if (!searchText) return;

    try {
      const response = await fetch(
        `https://nominatim.openstreetmap.org/search?format=json&q=${encodeURIComponent(searchText)}`,
        {
          headers: {
            "User-Agent": "MyExpoApp/1.0 (example@example.com)",
          },
        }
      );

      const data = await response.json();

      if (data.length > 0) {
        const firstResult = data[0];
        const lat = parseFloat(firstResult.lat);
        const lon = parseFloat(firstResult.lon);

        setRegion({
          ...region,
          latitude: lat,
          longitude: lon,
        });

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

  return (
    <View style={styles.container}>
      {/* Search Input */}
      <View style={styles.searchContainer}>
        <TextInput
          style={styles.input}
          placeholder="Search city or location"
          value={searchText}
          onChangeText={setSearchText}
        />
        <Button title="Search" onPress={handleSearch} />
      </View>

      {/* Map */}
      <MapView style={styles.map} region={region}>
        <UrlTile
          urlTemplate="https://{s}.basemaps.cartocdn.com/rastertiles/voyager/{z}/{x}/{y}{r}.png"
          subdomains={["a", "b", "c", "d"]}
          maximumZ={19}
        />

        {marker && (
          <Marker
            coordinate={marker}
            title={searchText}
            description="Searched location"
          />
        )}
      </MapView>

      {/* OSM Attribution */}
      <View style={styles.attribution}>
        <Text style={{ fontSize: 12 }}>© OpenStreetMap contributors</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  map: { flex: 1 },
  attribution: {
    position: "absolute",
    bottom: 10,
    right: 10,
    backgroundColor: "rgba(255,255,255,0.7)",
    padding: 4,
    borderRadius: 4,
  },
  searchContainer: {
    position: "absolute",
    top: 40,
    left: 10,
    right: 10,
    zIndex: 10,
    flexDirection: "row",
    backgroundColor: "rgba(255,255,255,0.9)",
    borderRadius: 8,
    padding: 5,
    alignItems: "center",
  },
  input: {
    flex: 1,
    padding: 8,
    borderColor: "#ccc",
    borderWidth: 1,
    borderRadius: 6,
    marginRight: 5,
  },
});
