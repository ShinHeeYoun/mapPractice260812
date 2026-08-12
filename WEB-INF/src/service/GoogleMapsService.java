package service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
import java.util.ArrayList;
import java.util.Collections;
import java.util.Comparator;
import java.util.List;

import com.google.gson.Gson;
import com.google.gson.JsonArray;
import com.google.gson.JsonElement;
import com.google.gson.JsonObject;

import config.ConfigManager;

public class GoogleMapsService {
    
    private static final HttpClient httpClient = HttpClient.newHttpClient();

    public String geocode(String address) throws Exception {
        String apiKey = ConfigManager.getInstance().getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty() || apiKey.equals("YOUR_NEW_API_KEY_HERE")) {
            throw new Exception("API Key is not configured correctly on the server.");
        }

        String encodedAddress = URLEncoder.encode(address, StandardCharsets.UTF_8.toString());
        String url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + encodedAddress + "&key=" + apiKey;
        
        HttpRequest request = HttpRequest.newBuilder()
                .uri(URI.create(url))
                .GET()
                .build();
                
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    public String directions(String origin, String destination, String lang) throws Exception {
        String apiKey = ConfigManager.getInstance().getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty()) throw new Exception("API Key is missing.");

        String encodedOrigin = URLEncoder.encode(origin, StandardCharsets.UTF_8.toString());
        String encodedDest = URLEncoder.encode(destination, StandardCharsets.UTF_8.toString());
        String url = "https://maps.googleapis.com/maps/api/directions/json?origin=" + encodedOrigin 
                     + "&destination=" + encodedDest + "&mode=transit&language=" + lang + "&key=" + apiKey;
        
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).GET().build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    public String placeDetails(String placeId, String lang) throws Exception {
        String apiKey = ConfigManager.getInstance().getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty()) throw new Exception("API Key is missing.");

        String url = "https://maps.googleapis.com/maps/api/place/details/json?place_id=" + placeId 
                     + "&fields=name,rating,formatted_address,formatted_phone_number,opening_hours,reviews,geometry" 
                     + "&language=" + lang + "&key=" + apiKey;
        
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).GET().build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        return response.body();
    }

    public String placesNearby(double baseLat, double baseLng, String type, String sortBy, String lang) throws Exception {
        String apiKey = ConfigManager.getInstance().getApiKey();
        if (apiKey == null || apiKey.trim().isEmpty()) throw new Exception("API Key is missing.");

        String url = "https://maps.googleapis.com/maps/api/place/nearbysearch/json?location=" + baseLat + "," + baseLng 
                     + "&radius=1000&type=" + type + "&language=" + lang + "&key=" + apiKey;
        
        HttpRequest request = HttpRequest.newBuilder().uri(URI.create(url)).GET().build();
        HttpResponse<String> response = httpClient.send(request, HttpResponse.BodyHandlers.ofString());
        
        String jsonStr = response.body();
        
        // Parse and sort logic
        Gson gson = new Gson();
        JsonObject root = gson.fromJson(jsonStr, JsonObject.class);
        if (root.has("results") && root.get("status").getAsString().equals("OK")) {
            JsonArray results = root.getAsJsonArray("results");
            List<JsonObject> placeList = new ArrayList<>();
            for (JsonElement e : results) {
                placeList.add(e.getAsJsonObject());
            }

            placeList.sort(new Comparator<JsonObject>() {
                @Override
                public int compare(JsonObject a, JsonObject b) {
                    if ("distance".equals(sortBy)) {
                        double latA = a.getAsJsonObject("geometry").getAsJsonObject("location").get("lat").getAsDouble();
                        double lngA = a.getAsJsonObject("geometry").getAsJsonObject("location").get("lng").getAsDouble();
                        double latB = b.getAsJsonObject("geometry").getAsJsonObject("location").get("lat").getAsDouble();
                        double lngB = b.getAsJsonObject("geometry").getAsJsonObject("location").get("lng").getAsDouble();
                        
                        double distA = getDistance(baseLat, baseLng, latA, lngA);
                        double distB = getDistance(baseLat, baseLng, latB, lngB);
                        return Double.compare(distA, distB);
                    } else if ("rating".equals(sortBy)) {
                        double ratingA = a.has("rating") ? a.get("rating").getAsDouble() : 0;
                        int reviewsA = a.has("user_ratings_total") ? a.get("user_ratings_total").getAsInt() : 0;
                        double penaltyA = reviewsA == 0 ? 5.0 : (10.0 / (reviewsA + 1));
                        double scoreA = ratingA - penaltyA;

                        double ratingB = b.has("rating") ? b.get("rating").getAsDouble() : 0;
                        int reviewsB = b.has("user_ratings_total") ? b.get("user_ratings_total").getAsInt() : 0;
                        double penaltyB = reviewsB == 0 ? 5.0 : (10.0 / (reviewsB + 1));
                        double scoreB = ratingB - penaltyB;

                        return Double.compare(scoreB, scoreA); // descending
                    }
                    return 0;
                }
            });

            JsonArray sortedResults = new JsonArray();
            for (JsonObject obj : placeList) {
                sortedResults.add(obj);
            }
            root.add("results", sortedResults);
            return gson.toJson(root);
        }

        return jsonStr;
    }

    private double getDistance(double lat1, double lon1, double lat2, double lon2) {
        final int R = 6371; // km
        double dLat = Math.toRadians(lat2 - lat1);
        double dLon = Math.toRadians(lon2 - lon1);
        double a = Math.sin(dLat / 2) * Math.sin(dLat / 2) +
                   Math.cos(Math.toRadians(lat1)) * Math.cos(Math.toRadians(lat2)) *
                   Math.sin(dLon / 2) * Math.sin(dLon / 2);
        double c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
        return R * c;
    }
}
