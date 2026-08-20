package com.pestcontrol.backend;

import java.io.IOException;
import java.net.URI;
import java.net.http.HttpClient;
import java.net.http.HttpRequest;
import java.net.http.HttpResponse;
import java.net.URLEncoder;
import java.nio.charset.StandardCharsets;
import java.util.HashMap;

import org.springframework.beans.factory.annotation.Value;
import org.springframework.web.bind.annotation.GetMapping;
import org.springframework.web.bind.annotation.RequestParam;
import org.springframework.web.bind.annotation.RestController;

import com.fasterxml.jackson.databind.JsonNode;
import com.fasterxml.jackson.databind.ObjectMapper;

import jakarta.servlet.http.HttpServletResponse;

@RestController
public class AuthController {

    @Value("${github.client.id}")
    private String clientId;

    @Value("${github.client.secret}")
    private String clientSecret;

    @Value("${github.redirect-uri:http://localhost:8080/callback}")
    private String redirectUri;

    private final HttpClient httpClient = HttpClient.newHttpClient();
    private final ObjectMapper objectMapper = new ObjectMapper();

    @GetMapping("/auth/github")
    public void authorize(HttpServletResponse response) throws IOException {
        String authorizationUri = "https://github.com/login/oauth/authorize?client_id="
            + encode(clientId)
            + "&redirect_uri="
            + encode(redirectUri);
        response.sendRedirect(authorizationUri);
    }

    @GetMapping("/callback")
    public String callback(@RequestParam("code") String code) throws Exception
    {
        if(code == null || code.isEmpty())
        {
            return "No code provided by GitHub";
        }

        HashMap<String, String> requestBody = new HashMap<>();
        requestBody.put("client_id", clientId);
        requestBody.put("client_secret", clientSecret);
        requestBody.put("code", code);
        requestBody.put("redirect_uri", redirectUri);

        HttpRequest tokenRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://github.com/login/oauth/access_token"))
                .header("Content-Type", "application/json")
                .header("Accept", "application/json")
                .POST(HttpRequest.BodyPublishers.ofString(objectMapper.writeValueAsString(requestBody)))
                .build();

        HttpResponse<String> tokenResponse = httpClient.send(tokenRequest, HttpResponse.BodyHandlers.ofString());
        JsonNode tokenNode = objectMapper.readTree(tokenResponse.body());

        if(!tokenNode.has("access_token"))
        {
            return "Failed to retrieve  access token from GitHub.";
        }
        String accessToken = tokenNode.get("access_token").asText();
        HttpRequest userRequest = HttpRequest.newBuilder()
                .uri(URI.create("https://api.github.com/user"))
                .header("Authorization", "Bearer " + accessToken)
                .header("X-GitHub-Api-Version", "2022-11-28")
                .GET()
                .build();

        HttpResponse<String> userResponse = httpClient.send(userRequest, HttpResponse.BodyHandlers.ofString());
        JsonNode userNode = objectMapper.readTree(userResponse.body());

        return "<h1>Authentication Successful!</h1><p>Welcome, " + userNode.get("login").asText() + "</p>";
    }

    private String encode(String value) {
        return URLEncoder.encode(value, StandardCharsets.UTF_8);
    }
}
