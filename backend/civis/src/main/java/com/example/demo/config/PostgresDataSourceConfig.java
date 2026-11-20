package com.example.demo.config;

import com.zaxxer.hikari.HikariConfig;
import com.zaxxer.hikari.HikariDataSource;
import org.springframework.beans.factory.annotation.Value;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;
import org.springframework.context.annotation.Profile;

import javax.sql.DataSource;
import java.net.URI;
import java.net.URLDecoder;
import java.nio.charset.StandardCharsets;

@Configuration(proxyBeanMethods = false)
@Profile("postgres")
public class PostgresDataSourceConfig {

    @Bean
    public DataSource dataSource(
            @Value("${spring.datasource.url}") String configuredUrl,
            @Value("${spring.datasource.username:}") String configuredUsername,
            @Value("${spring.datasource.password:}") String configuredPassword
    ) {
        String jdbcUrl = configuredUrl;
        String username = configuredUsername;
        String password = configuredPassword;

        if (configuredUrl.startsWith("postgres://") || configuredUrl.startsWith("postgresql://")) {
            URI uri = URI.create(configuredUrl);
            String host = uri.getHost();
            int port = uri.getPort() > 0 ? uri.getPort() : 5432;
            String path = uri.getPath();

            jdbcUrl = "jdbc:postgresql://" + host + ":" + port + path;
            if (uri.getRawQuery() != null && !uri.getRawQuery().isBlank()) {
                jdbcUrl += "?" + uri.getRawQuery();
            }

            if (uri.getRawUserInfo() != null) {
                String[] parts = uri.getRawUserInfo().split(":", 2);
                username = decode(parts[0]);
                if (parts.length == 2) {
                    password = decode(parts[1]);
                }
            }
        }

        if (!jdbcUrl.startsWith("jdbc:")) {
            throw new IllegalStateException("DB_URL/DATABASE_URL must be a PostgreSQL JDBC URL or postgres:// URL");
        }

        HikariConfig hikari = new HikariConfig();
        hikari.setJdbcUrl(jdbcUrl);
        if (username != null && !username.isBlank()) hikari.setUsername(username);
        if (password != null && !password.isBlank()) hikari.setPassword(password);
        hikari.setMaximumPoolSize(5);
        return new HikariDataSource(hikari);
    }

    private String decode(String value) {
        return URLDecoder.decode(value, StandardCharsets.UTF_8);
    }
}
