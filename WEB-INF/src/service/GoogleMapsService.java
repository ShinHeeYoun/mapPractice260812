package service;

import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;
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
}
