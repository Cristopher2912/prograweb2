package com.arqui.backend.config;

import com.arqui.backend.model.Product;
import com.arqui.backend.repository.ProductRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.context.annotation.Bean;
import org.springframework.context.annotation.Configuration;

@Configuration
public class DataSeeder {

    @Bean
    CommandLineRunner initDatabase(ProductRepository repo) {
        return args -> {
            repo.save(new Product("Laptop Dell", 1200.0, 15));
            repo.save(new Product("Mouse Inalambrico", 25.5, 40));
            repo.save(new Product("Teclado Mecanico", 70.0, 20));
        };
    }
}
