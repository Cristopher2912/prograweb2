package com.arqui.backend.controller;

import com.arqui.backend.model.Product;
import com.arqui.backend.repository.ProductRepository;
import org.springframework.http.HttpStatus;
import org.springframework.http.ResponseEntity;
import org.springframework.web.bind.annotation.*;

import java.util.List;

@RestController
@RequestMapping("/api/products")
@CrossOrigin(origins = "*", allowedHeaders = "*", methods = {RequestMethod.GET, RequestMethod.POST, RequestMethod.PUT, RequestMethod.DELETE, RequestMethod.OPTIONS})
public class ProductController {

    private final ProductRepository repository;

    public ProductController(ProductRepository repository) {
        this.repository = repository;
    }

    // 1. LISTAR TODOS (GET)
    @GetMapping
    public List<Product> getAll() {
        return repository.findAll();
    }

    // 2. OBTENER UNO POR ID (GET)
    @GetMapping("/{id}")
    public ResponseEntity<Product> getById(@PathVariable Long id) {
        return repository.findById(id)
                .map(ResponseEntity::ok)
                .orElse(ResponseEntity.notFound().build());
    }

    // 3. CREAR PRODUCTO (POST)
    @PostMapping
    public ResponseEntity<Product> create(@RequestBody Product product) {
        Product saved = repository.save(product);
        return new ResponseEntity<>(saved, HttpStatus.CREATED);
    }

    // 4. ACTUALIZAR PRODUCTO (PUT)
    @PutMapping("/{id}")
    public ResponseEntity<Product> update(@PathVariable Long id, @RequestBody Product product) {
        return repository.findById(id).map(existing -> {
            existing.setName(product.getName());
            existing.setPrice(product.getPrice());
            existing.setStock(product.getStock());
            return ResponseEntity.ok(repository.save(existing));
        }).orElse(ResponseEntity.notFound().build());
    }

    // 5. ELIMINAR PRODUCTO (DELETE)
    @DeleteMapping("/{id}")
    public ResponseEntity<Void> delete(@PathVariable Long id) {
        if (repository.existsById(id)) {
            repository.deleteById(id);
            return ResponseEntity.noContent().build();
        }
        return ResponseEntity.notFound().build();
    }
}
