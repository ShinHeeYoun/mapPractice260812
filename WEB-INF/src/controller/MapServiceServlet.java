package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;
import config.ConfigManager;
import service.GoogleMapsService;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;

public class MapServiceServlet extends HttpServlet {
    
    private static final Gson gson = new Gson();
    private GoogleMapsService googleMapsService;

    @Override
    public void init() throws ServletException {
        // Initialize Configuration
        String configPath = getServletContext().getRealPath("/WEB-INF/config.properties");
        ConfigManager.init(configPath);
        
        // Initialize Services
        googleMapsService = new GoogleMapsService();
    }

    @Override
    protected void doPost(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        request.setCharacterEncoding("UTF-8");
        response.setContentType("application/json; charset=UTF-8");
        
        PrintWriter out = response.getWriter();
        
        try {
            // Read JSON payload
            StringBuilder sb = new StringBuilder();
            String line;
            try (BufferedReader reader = request.getReader()) {
                while ((line = reader.readLine()) != null) {
                    sb.append(line);
                }
            }
            
            JsonObject payload = gson.fromJson(sb.toString(), JsonObject.class);
            
            if (payload == null || !payload.has("action")) {
                out.print("{\"status\":\"error\", \"message\":\"Invalid payload\"}");
                return;
            }
            
            String action = payload.get("action").getAsString();
            
            // Route to appropriate service method
            if ("geocode".equals(action)) {
                JsonObject data = payload.getAsJsonObject("data");
                String address = data.get("address").getAsString();
                
                String googleResponse = googleMapsService.geocode(address);
                out.print(googleResponse);
                
            } else if ("directions".equals(action)) {
                JsonObject data = payload.getAsJsonObject("data");
                String origin = data.get("origin").getAsString();
                String destination = data.get("destination").getAsString();
                String lang = data.has("lang") ? data.get("lang").getAsString() : "en";
                
                String googleResponse = googleMapsService.directions(origin, destination, lang);
                out.print(googleResponse);

            } else if ("places".equals(action)) {
                JsonObject data = payload.getAsJsonObject("data");
                double lat = data.get("lat").getAsDouble();
                double lng = data.get("lng").getAsDouble();
                String type = data.get("type").getAsString();
                String sortBy = data.get("sortBy").getAsString();
                String lang = data.has("lang") ? data.get("lang").getAsString() : "en";
                
                String googleResponse = googleMapsService.placesNearby(lat, lng, type, sortBy, lang);
                out.print(googleResponse);

            } else if ("placeDetails".equals(action)) {
                JsonObject data = payload.getAsJsonObject("data");
                String placeId = data.get("placeId").getAsString();
                String lang = data.has("lang") ? data.get("lang").getAsString() : "en";
                
                String googleResponse = googleMapsService.placeDetails(placeId, lang);
                out.print(googleResponse);

            } else {
                out.print("{\"status\":\"error\", \"message\":\"Unknown action\"}");
            }
            
        } catch (Exception e) {
            e.printStackTrace();
            out.print("{\"status\":\"error\", \"message\":\"" + e.getMessage() + "\"}");
        } finally {
            out.flush();
        }
    }
}
