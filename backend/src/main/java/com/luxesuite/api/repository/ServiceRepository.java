package com.luxesuite.api.repository;

import com.luxesuite.api.model.Service;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.Pageable;

@Repository
public interface ServiceRepository extends JpaRepository<Service, Long> {
    @org.springframework.data.jpa.repository.Query("SELECT s FROM Service s WHERE s.businessType IN :types")
    Page<Service> findByBusinessTypeIn(@org.springframework.data.repository.query.Param("types") java.util.List<String> types, Pageable pageable);

    @org.springframework.data.jpa.repository.Query("SELECT s FROM Service s WHERE s.isActive = true AND s.businessType IN :types")
    Page<Service> findByIsActiveTrueAndBusinessTypeIn(@org.springframework.data.repository.query.Param("types") java.util.List<String> types, Pageable pageable);
    Page<Service> findByIsActiveTrue(Pageable pageable);

    @org.springframework.data.jpa.repository.Query(value = "SELECT s.* FROM services s LEFT JOIN appointment_services as_rel ON s.id = as_rel.service_id WHERE s.is_active = true GROUP BY s.id ORDER BY COUNT(as_rel.id) DESC LIMIT :limit", nativeQuery = true)
    List<Service> findTopServicesByBookingCountNative(@org.springframework.data.repository.query.Param("limit") int limit);
}
