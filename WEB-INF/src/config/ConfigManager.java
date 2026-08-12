package config;

import java.io.File;
import java.io.FileInputStream;
import java.io.IOException;
import java.util.Properties;

public class ConfigManager {
    private static ConfigManager instance;
    private String apiKey = "";

    private ConfigManager(String configPath) {
        loadConfig(configPath);
    }

    public static synchronized void init(String configPath) {
        if (instance == null) {
            instance = new ConfigManager(configPath);
        }
    }

    public static ConfigManager getInstance() {
        if (instance == null) {
            throw new IllegalStateException("ConfigManager is not initialized.");
        }
        return instance;
    }

    private void loadConfig(String configPath) {
        if (configPath != null) {
            File configFile = new File(configPath);
            if (configFile.exists()) {
                try (FileInputStream fis = new FileInputStream(configFile)) {
                    Properties props = new Properties();
                    props.load(fis);
                    apiKey = props.getProperty("google.maps.api.key", "");
                } catch (IOException e) {
                    e.printStackTrace();
                }
            }
        }
    }

    public String getApiKey() {
        return apiKey;
    }
}
