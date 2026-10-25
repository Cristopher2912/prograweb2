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
            repo.save(new Product("Wireless Mouse", 25.5, 40));
            repo.save(new Product("Mechanical Keyboard", 70.0, 20));
            repo.save(new Product("Monitor UltraWide 34\"", 450.0, 8));
            repo.save(new Product("Noise Cancelling Headphones", 180.0, 12));
            repo.save(new Product("Webcam 4K HDR", 95.0, 25));
            repo.save(new Product("USB Condenser Microphone", 110.0, 18));
            repo.save(new Product("Ergonomic Pro Chair", 299.9, 5));
            repo.save(new Product("USB-C Hub", 45.0, 30));
            repo.save(new Product("Portable SSD 1TB", 89.99, 22));
            repo.save(new Product("Bluetooth Speaker", 59.5, 35));
            repo.save(new Product("Tablet Stand", 19.99, 50));
        };
    }
}
