<%@ page language="java" contentType="text/html; charset=UTF-8" pageEncoding="UTF-8" %>
<%@ page import="java.util.Properties, java.io.FileInputStream, java.io.File" %>
<%
    Properties props = new Properties();
    String apiKey = "";
    String configPath = application.getRealPath("/WEB-INF/config.properties");
    if (configPath != null) {
        File configFile = new File(configPath);
        if (configFile.exists()) {
            try (FileInputStream fis = new FileInputStream(configFile)) {
                props.load(fis);
                apiKey = props.getProperty("google.maps.api.key", "");
            } catch (Exception e) {}
        }
    }
%>
<!DOCTYPE html>
<html lang="ko">
<head>
    <meta charset="UTF-8">
    <title>Signatural API NEWS</title>
    <link rel="stylesheet" href="css/style.css">
    <% if (!apiKey.isEmpty()) { %>
    <script src="https://maps.googleapis.com/maps/api/js?key=<%=apiKey%>&callback=initMap&libraries=places" async defer></script>
    <% } else { %>
    <script>console.error("Google Maps API Key not found in config.properties");</script>
    <% } %>
</head>
<body>
    <header class="newspaper-header">
        <h1>Signatural API NEWS</h1>
        <div class="sub-header">
            <span>Vol. 1</span>
            <span>SEOUL, KOREA</span>
            <span id="current-date"></span>
            <span>Daily Edition</span>
        </div>
    </header>

    <div class="container">
        <!-- Sidebar Navigation -->
        <nav class="sidebar">
            <h2>CONTENTS</h2>
            <ul id="nav-tabs">
                <li><a href="#" data-target="section-intro" class="active">I. Introduction</a></li>
                <li>
                    <span class="nav-category">II. Map</span>
                    <ul class="sub-nav">
                        <li><a href="#" data-target="section-map-geocode">A. Geocoding</a></li>
                        <li><a href="#" data-target="section-map-directions">B. Directions</a></li>
                        <li><a href="#" data-target="section-map-places">C. Local Directory</a></li>
                    </ul>
                </li>
            </ul>
        </nav>

        <!-- Main Content Area -->
        <main class="content-area">
            <!-- Intro Section -->
            <section id="section-intro" class="tab-content active">
                <h2 class="article-title">Welcome to Signatural API NEWS</h2>
                <p class="article-text">
                    This is a simple Java Web Application skeleton running on Tomcat 9. 
                    It is designed using a classic black and white newspaper theme.
                </p>
                <p class="article-text" style="column-count: 1;">
                    Please navigate to the Map section to use the Telegraphic Mapping Service and Directions.
                </p>
            </section>

            <!-- Geocoding Section -->
            <section id="section-map-geocode" class="tab-content">
                <h2 class="article-title">GEOCODING SERVICE</h2>
                <div class="map-form-container">
                    <p class="article-text" style="column-count: 1;">Enter a location to receive its geographic coordinates.</p>
                    <div class="input-group">
                        <label for="address-input"><strong>Target Location:</strong></label>
                        <input type="text" id="address-input" class="newspaper-input" placeholder="e.g. Seoul Tower">
                        <button id="geocode-btn" class="newspaper-btn">DISPATCH TELEGRAM</button>
                    </div>
                </div>
                <div id="map-result-container" class="map-result-container hidden"></div>
            </section>

            <!-- Directions Section -->
            <section id="section-map-directions" class="tab-content">
                <h2 class="article-title">DIRECTIONS SERVICE</h2>
                <div class="map-form-container">
                    <p class="article-text" style="column-count: 1;">Enter your origin and destination to calculate the best transit route, distance, and estimated costs. (Autocomplete is enabled)</p>
                    <div class="input-group">
                        <label for="origin-input"><strong>Origin:</strong></label>
                        <input type="text" id="origin-input" class="newspaper-input" placeholder="e.g. Gangnam Station">
                    </div>
                    <div class="input-group">
                        <label for="destination-input"><strong>Destination:</strong></label>
                        <input type="text" id="destination-input" class="newspaper-input" placeholder="e.g. Seoul Tower">
                    </div>
                    <div class="input-group" style="justify-content: flex-end; margin-top: 15px;">
                        <button id="directions-btn" class="newspaper-btn">CALCULATE ROUTE</button>
                    </div>
                </div>
                <div id="directions-result-container" class="map-result-container hidden"></div>
            </section>

            <!-- Local Directory (Places) Section -->
            <section id="section-map-places" class="tab-content">
                <h2 class="article-title">LOCAL DIRECTORY</h2>
                <div class="map-form-container">
                    <p class="article-text" style="column-count: 1;">Search the classifieds for local businesses and points of interest near your designated location.</p>
                    <div class="input-group">
                        <label for="places-input"><strong>Base Location:</strong></label>
                        <input type="text" id="places-input" class="newspaper-input" placeholder="e.g. Gangnam Station">
                    </div>
                    <div class="input-group">
                        <label for="places-category"><strong>Category:</strong></label>
                        <select id="places-category" class="newspaper-input" style="cursor: pointer;">
                            <option value="restaurant">Restaurants (Diners & Eateries)</option>
                            <option value="cafe">Cafes (Coffee Houses)</option>
                            <option value="bakery">Bakeries</option>
                            <option value="hospital">Hospitals & Clinics</option>
                            <option value="park">Parks & Recreation</option>
                        </select>
                    </div>
                    <div class="input-group" style="justify-content: flex-end; margin-top: 15px;">
                        <button id="places-btn" class="newspaper-btn">SEARCH DIRECTORY</button>
                    </div>
                </div>
            </section>
            
            <!-- Global Map Container (Shared across Geocode, Directions, Places) -->
            <div id="map-container" class="map-container hidden">
                <div id="map"></div>
            </div>

            <!-- Places List Result Container -->
            <div id="places-result-container" class="map-result-container hidden"></div>

            <!-- Global Itinerary Container (Placed below map as requested) -->
            <div id="itinerary-container" class="map-result-container hidden"></div>
            
        </main>
    </div>

    <script type="module" src="js/main.js"></script>
</body>
</html>
