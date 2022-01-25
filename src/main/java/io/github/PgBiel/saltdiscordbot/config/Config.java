package io.github.PgBiel.saltdiscordbot.config;

import io.github.PgBiel.saltdiscordbot.SaltBot;
import org.yaml.snakeyaml.Yaml;
import org.yaml.snakeyaml.constructor.Constructor;

import java.io.InputStream;

public class Config {
    private static Config instance;
    private String token;

    private Config() {
        instance = this;
    }

    public static Config getInstance() {
        if (instance == null) {
            Yaml yaml = new Yaml(new Constructor(Config.class));
            InputStream inputStream = Config.class.getClassLoader().getResourceAsStream("config.yaml");
            instance = yaml.load(inputStream);
        }
        return instance;
    }

    public String getToken() {
        return token;
    }

    public void setToken(String token) {
        this.token = token;
    }
}
