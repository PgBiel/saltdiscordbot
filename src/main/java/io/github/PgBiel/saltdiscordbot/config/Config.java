package io.github.PgBiel.saltdiscordbot.config;

public class Config {
    private static Config instance;
    private String token;

    public Config() { instance = this; }

    public static Config getInstance() {
        return instance;
    }

    public String getToken() {
        return token;
    }
}
