package com.luxesuite.api.repository;

import com.luxesuite.api.model.Product;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface ProductRepository extends JpaRepository<Product, Long> {
    Page<Product> findByIsActiveTrue(Pageable pageable);
    Page<Product> findByIsActiveTrueAndTypeIgnoreCase(String type, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Product p WHERE p.isActive = true AND UPPER(p.type) = UPPER(:type) AND p.businessType IN :types")
    Page<Product> findByIsActiveTrueAndTypeIgnoreCaseAndBusinessTypeIn(@org.springframework.data.repository.query.Param("type") String type, @org.springframework.data.repository.query.Param("types") java.util.List<String> types, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT p FROM Product p WHERE p.isActive = true AND p.businessType IN :types")
    Page<Product> findByIsActiveTrueAndBusinessTypeIn(@org.springframework.data.repository.query.Param("types") java.util.List<String> types, Pageable pageable);
}
