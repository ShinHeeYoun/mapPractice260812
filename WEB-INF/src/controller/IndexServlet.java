package controller;

import config.ConfigManager;

import javax.servlet.ServletException;
import javax.servlet.http.HttpServlet;
import javax.servlet.http.HttpServletRequest;
import javax.servlet.http.HttpServletResponse;
import java.io.IOException;

public class IndexServlet extends HttpServlet {
    
    @Override
    public void init() throws ServletException {
        // Initialize Configuration if not already done
        String configPath = getServletContext().getRealPath("/WEB-INF/config.properties");
        if (configPath != null) {
            ConfigManager.init(configPath);
        }
    }

    @Override
    protected void doGet(HttpServletRequest request, HttpServletResponse response) throws ServletException, IOException {
        
        // 1. Fetch API Key from Model (ConfigManager)
        String apiKey = "";
        try {
            apiKey = ConfigManager.getInstance().getApiKey();
        } catch (Exception e) {
            e.printStackTrace();
        }
        
        // 2. Handle Language Parameter
        String lang = request.getParameter("lang");
        if (lang == null || (!lang.equals("ko") && !lang.equals("en"))) {
            lang = "en";
        }
        
        // 3. Set attributes for the View (JSP)
        request.setAttribute("apiKey", apiKey);
        request.setAttribute("lang", lang);
        
        // 4. Forward to the protected JSP View
        request.getRequestDispatcher("/WEB-INF/views/index.jsp").forward(request, response);
    }
}
