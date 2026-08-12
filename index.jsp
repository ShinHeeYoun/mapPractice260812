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
    
    // Handle Language Parameter
    String lang = request.getParameter("lang");
    if (lang == null || (!lang.equals("ko") && !lang.equals("en"))) {
        lang = "en";
    }
%>
<!DOCTYPE html>
<html lang="<%=lang%>">
<head>
    <meta charset="UTF-8">
    <title>Signatural API NEWS</title>
    <link rel="stylesheet" href="css/style.css">
    <script>window.APP_LANG = '<%=lang%>';</script>
    <% if (!apiKey.isEmpty()) { %>
    <script src="https://maps.googleapis.com/maps/api/js?key=<%=apiKey%>&language=<%=lang%>&callback=initMap&libraries=places" async defer></script>
    <% } else { %>
    <script>console.error("Google Maps API Key not found in config.properties");</script>
    <% } %>
</head>
<body>
    <header class="newspaper-header">
        <h1>Signatural API NEWS</h1>
        <div class="lang-toggle-container">
            <a href="?lang=en" class="lang-btn <%= lang.equals("en") ? "active" : "" %>">EN</a> | 
            <a href="?lang=ko" class="lang-btn <%= lang.equals("ko") ? "active" : "" %>">KR</a>
        </div>
        <div class="sub-header">
            <span data-i18n="vol">Vol. 1</span>
            <span data-i18n="city">SEOUL, KOREA</span>
            <span id="current-date"></span>
            <span data-i18n="edition">Daily Edition</span>
        </div>
    </header>

    <div class="container">
        <!-- Sidebar Navigation -->
        <nav class="sidebar">
            <h2 data-i18n="contents">CONTENTS</h2>
            <ul id="nav-tabs">
                <li><a href="#" data-target="section-intro" class="active" data-i18n="tab_intro">I. Introduction</a></li>
                <li>
                    <span class="nav-category" data-i18n="tab_map">II. Map</span>
                    <ul class="sub-nav">
                        <li><a href="#" data-target="section-map-geocode" data-i18n="tab_place">A. Place</a></li>
                        <li><a href="#" data-target="section-map-directions" data-i18n="tab_route">B. Route Find</a></li>
                        <li><a href="#" data-target="section-map-places" data-i18n="tab_restaurants">C. Restaurants</a></li>
                    </ul>
                </li>
            </ul>
        </nav>

        <!-- Main Content Area -->
        <main class="content-area">
            <!-- Intro Section -->
            <section id="section-intro" class="tab-content active">
                <h2 class="article-title" data-i18n="intro_title">Welcome to Signatural API NEWS</h2>
                <p class="article-text" data-i18n="intro_p1">
                    This is a simple Java Web Application skeleton running on Tomcat 9. 
                    It is designed using a classic black and white newspaper theme.
                </p>
                <p class="article-text" style="column-count: 1;" data-i18n="intro_p2">
                    Please navigate to the Map section to use the Telegraphic Mapping Service and Directions.
                </p>
            </section>

            <!-- Geocoding Section -->
            <section id="section-map-geocode" class="tab-content">
                <h2 class="article-title" data-i18n="place_title">PLACE</h2>
                <div class="map-form-container">
                    <p class="article-text" style="column-count: 1;" data-i18n="place_desc">
                        This page utilizes the Google Maps Geocoding API to convert physical addresses into geographic coordinates. When a user submits an address, a JSON payload is sent to our Java backend servlet via an asynchronous fetch request. The Java backend then securely constructs an HTTP GET request containing our private API key and forwards it to Google's servers. Upon success, Google returns a comprehensive JSON response containing the exact latitude, longitude, and formatted address, which our frontend then uses to center the map and drop a precise marker.
                    </p>
                    <div class="input-group">
                        <label for="address-input"><strong data-i18n="lbl_target">Target Location:</strong></label>
                        <input type="text" id="address-input" class="newspaper-input" placeholder="e.g. Seoul Tower" data-i18n-placeholder="ph_seoul_tower">
                        <button id="geocode-btn" class="newspaper-btn" data-i18n="btn_dispatch">DISPATCH TELEGRAM</button>
                    </div>
                </div>
                <div id="map-result-container" class="map-result-container hidden"></div>
            </section>

            <!-- Directions Section -->
            <section id="section-map-directions" class="tab-content">
                <h2 class="article-title" data-i18n="route_title">ROUTE FIND</h2>
                <div class="map-form-container">
                    <p class="article-text" style="column-count: 1;" data-i18n="route_desc">
                        This section employs the Google Maps Directions API via the Maps JavaScript SDK to calculate optimal transit routes. When you provide an origin and destination, the browser directly sends a routing request to Google specifying 'TRANSIT' as the preferred travel mode. Google processes this request and returns a detailed JSON object containing route legs, total distance, estimated duration, and step-by-step transit instructions. Our application then uses a DirectionsRenderer to automatically draw the polyline path on the map and parses the nested steps to display a continuous text itinerary.
                    </p>
                    <div class="input-group">
                        <label for="origin-input"><strong data-i18n="lbl_origin">Origin:</strong></label>
                        <input type="text" id="origin-input" class="newspaper-input" placeholder="e.g. Gangnam Station" data-i18n-placeholder="ph_gangnam">
                    </div>
                    <div class="input-group">
                        <label for="destination-input"><strong data-i18n="lbl_destination">Destination:</strong></label>
                        <input type="text" id="destination-input" class="newspaper-input" placeholder="e.g. Seoul Tower" data-i18n-placeholder="ph_seoul_tower">
                    </div>
                    <div class="input-group" style="justify-content: flex-end; margin-top: 15px;">
                        <button id="directions-btn" class="newspaper-btn" data-i18n="btn_calc">CALCULATE ROUTE</button>
                    </div>
                </div>
                <div id="directions-result-container" class="map-result-container hidden"></div>
            </section>

            <!-- Local Directory (Places) Section -->
            <section id="section-map-places" class="tab-content">
                <h2 class="article-title" data-i18n="rest_title">RESTAURANTS</h2>
                <div class="map-form-container">
                    <p class="article-text" style="column-count: 1;" data-i18n="rest_desc">
                        This directory leverages the Google Maps Places API to discover local businesses around a specified center point. First, it uses the Geocoder API to convert your string-based base location into precise latitudinal and longitudinal coordinates. Next, it sends a nearbySearch request to the Places service, specifying a 1000-meter radius and the selected establishment type. The API returns an array of Place objects containing names, vicinities, user ratings, and price levels, which we subsequently sort using a custom Haversine distance algorithm and a rating penalty before displaying them in a tabular format.
                    </p>
                    <div class="input-group">
                        <label for="places-input"><strong data-i18n="lbl_base">Base Location:</strong></label>
                        <input type="text" id="places-input" class="newspaper-input" placeholder="e.g. Gangnam Station" data-i18n-placeholder="ph_gangnam">
                    </div>
                    <div class="input-group">
                        <label for="places-category"><strong data-i18n="lbl_category">Category:</strong></label>
                        <select id="places-category" class="newspaper-input" style="cursor: pointer;">
                            <option value="restaurant" data-i18n="opt_restaurant">Restaurants (Diners & Eateries)</option>
                            <option value="cafe" data-i18n="opt_cafe">Cafes (Coffee Houses)</option>
                            <option value="bakery" data-i18n="opt_bakery">Bakeries</option>
                            <option value="hospital" data-i18n="opt_hospital">Hospitals & Clinics</option>
                            <option value="park" data-i18n="opt_park">Parks & Recreation</option>
                        </select>
                    </div>
                    <div class="input-group">
                        <label for="places-sort"><strong data-i18n="lbl_sort">Sort By:</strong></label>
                        <select id="places-sort" class="newspaper-input" style="cursor: pointer;">
                            <option value="distance" data-i18n="opt_distance">Distance (Nearest First)</option>
                            <option value="rating" data-i18n="opt_rating">Rating (Highest First)</option>
                        </select>
                    </div>
                    <div class="input-group" style="justify-content: flex-end; margin-top: 15px;">
                        <button id="places-btn" class="newspaper-btn" data-i18n="btn_search_dir">SEARCH DIRECTORY</button>
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
