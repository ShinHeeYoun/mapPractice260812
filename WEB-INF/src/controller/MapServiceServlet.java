package controller;

import com.google.gson.Gson;
import com.google.gson.JsonObject;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.BufferedReader;
import java.io.IOException;
import java.io.PrintWriter;
import java.net.URI;
import java.net.URLEncoder;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.nio.charset.StandardCharsets;

public class MapServiceServlet extends HttpServlet {
    
    // TODO: Replace with actual API KEY
    private static final String API_KEY = "AIzaSyDA5SUTtBplEtvarp-kCtqedKycXQqwjOk";
    private static final Gson gson = new Gson();
    private static final HttpClient httpClient = HttpClient.newHttpClient();

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
            
            if ("geocode".equals(action)) {
                JsonObject data = payload.getAsJsonObject("data");
                String address = data.get("address").getAsString();
                
                // Call Google Maps API
                String encodedAddress = URLEncoder.encode(address, StandardCharsets.UTF_8.toString());
                String url = "https://maps.googleapis.com/maps/api/geocode/json?address=" + encodedAddress + "&key=" + API_KEY;
                
                HttpRequest googleRequest = HttpRequest.newBuilder()
                        .uri(URI.create(url))
                        .GET()
                        .build();
                        
                HttpResponse<String> googleResponse = httpClient.send(googleRequest, HttpResponse.BodyHandlers.ofString());
                
                // Return Google's response directly to frontend
                out.print(googleResponse.body());
                
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
