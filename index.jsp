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
    <title>THE MAP PRACTICE TIMES</title>
    <link rel="stylesheet" href="css/style.css">
    <% if (!apiKey.isEmpty()) { %>
    <script src="https://maps.googleapis.com/maps/api/js?key=<%=apiKey%>&callback=initMap" async defer></script>
    <% } else { %>
    <script>console.error("Google Maps API Key not found in config.properties");</script>
    <% } %>
</head>
<body>
    <header class="newspaper-header">
        <h1>THE MAP PRACTICE TIMES</h1>
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
                <li><a href="#" data-target="section-map">II. Map</a></li>
            </ul>
        </nav>

        <!-- Main Content Area -->
        <main class="content-area">
            <!-- Intro Section -->
            <section id="section-intro" class="tab-content active">
                <h2 class="article-title">Welcome to The Times</h2>
                <p class="article-text">
                    This is a simple Java Web Application skeleton running on Tomcat 9. 
                    It is designed using a classic black and white newspaper theme.
                    Currently, we have integrated the Google Maps API for geocoding and visual mapping.
                </p>
                <p class="article-text" style="column-count: 1;">
                    Please navigate to the Map section to use the Telegraphic Mapping Service.
                </p>
            </section>

            <!-- Map Section -->
            <section id="section-map" class="tab-content">
                <h2 class="article-title">MAP SERVICES</h2>
                <div class="map-form-container">
                    <p class="article-text" style="column-count: 1;">Please enter a location to receive its geographic coordinates directly from Google's Telegraphic Mapping Service (API). Press 'Enter' or click the dispatch button.</p>
                    <div class="input-group">
                        <label for="address-input"><strong>Target Location:</strong></label>
                        <input type="text" id="address-input" class="newspaper-input" placeholder="e.g. Seoul Tower">
                        <button id="geocode-btn" class="newspaper-btn">DISPATCH TELEGRAM</button>
                    </div>
                </div>
                <div id="map-result-container" class="map-result-container hidden">
                    <!-- Results will be injected here -->
                </div>
                <div id="map-container" class="map-container hidden">
                    <div id="map"></div>
                </div>
            </section>
        </main>
    </div>

    <script src="js/app.js"></script>
</body>
</html>
