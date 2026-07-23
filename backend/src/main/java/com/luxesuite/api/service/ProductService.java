package com.luxesuite.api.service;

import com.luxesuite.api.dto.ProductDto;
import com.luxesuite.api.model.Product;
import com.luxesuite.api.model.Inventory;
import com.luxesuite.api.model.InventoryTransaction;
import com.luxesuite.api.model.Branch;
import com.luxesuite.api.repository.ProductRepository;
import com.luxesuite.api.repository.InventoryRepository;
import com.luxesuite.api.repository.InventoryTransactionRepository;
import com.luxesuite.api.repository.BranchRepository;
import com.luxesuite.api.exception.ResourceNotFoundException;
import lombok.RequiredArgsConstructor;
import org.springframework.stereotype.Service;
import org.springframework.transaction.annotation.Transactional;

import org.springframework.data.domain.Page;
import org.springframework.data.domain.PageRequest;
import com.luxesuite.api.dto.PageResponse;

import java.util.List;
import java.util.stream.Collectors;

@Service
@RequiredArgsConstructor
public class ProductService {

    private final ProductRepository productRepository;
    private final InventoryRepository inventoryRepository;
    private final InventoryTransactionRepository inventoryTransactionRepository;
    private final BranchRepository branchRepository;

    @Transactional(readOnly = true)
    @org.springframework.cache.annotation.Cacheable(value = "products", key = "'retail_' + #page + '_' + #size + '_' + (#branchId != null ? #branchId : 'global') + '_' + #businessType")
    public PageResponse<ProductDto> getRetailProducts(int page, int size, Long branchId, String businessType) {
        Page<Product> productPage;
        String bType = businessType != null ? businessType : "BOTH";
        List<String> validTypes = "BOTH".equals(bType) ? java.util.Arrays.asList("SPA", "SALON", "BOTH") : java.util.Arrays.asList("BOTH", bType);
        
        if (branchId != null) {
            Branch branch = branchRepository.findById(branchId).orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
            String branchType = branch.getBusinessType() != null ? branch.getBusinessType() : "BOTH";
            List<String> combinedTypes = "BOTH".equals(branchType) ? validTypes : java.util.Arrays.asList("BOTH", branchType);
            
            if (!"BOTH".equals(bType) && !"BOTH".equals(branchType) && !bType.equals(branchType)) {
                combinedTypes = java.util.Collections.emptyList();
            } else if (!"BOTH".equals(bType)) {
                combinedTypes = java.util.Arrays.asList("BOTH", bType);
            }
            
            productPage = productRepository.findByIsActiveTrueAndTypeIgnoreCaseAndBusinessTypeIn("RETAIL", combinedTypes, PageRequest.of(page, size));
        } else {
            productPage = productRepository.findByIsActiveTrueAndTypeIgnoreCaseAndBusinessTypeIn("RETAIL", validTypes, PageRequest.of(page, size));
        }
        return PageResponse.of(productPage.map(this::mapToDto));
    }

    @Transactional(readOnly = true)
    @org.springframework.cache.annotation.Cacheable(value = "products", key = "'all_' + #page + '_' + #size + '_' + (#branchId != null ? #branchId : 'global') + '_' + #businessType")
    public PageResponse<ProductDto> getAllProducts(int page, int size, Long branchId, String businessType) {
        Page<Product> productPage;
        String bType = businessType != null ? businessType : "BOTH";
        List<String> validTypes = "BOTH".equals(bType) ? java.util.Arrays.asList("SPA", "SALON", "BOTH") : java.util.Arrays.asList("BOTH", bType);
        
        if (branchId != null) {
            Branch branch = branchRepository.findById(branchId).orElseThrow(() -> new ResourceNotFoundException("Branch not found"));
            String branchType = branch.getBusinessType() != null ? branch.getBusinessType() : "BOTH";
            List<String> combinedTypes = "BOTH".equals(branchType) ? validTypes : java.util.Arrays.asList("BOTH", branchType);
            
            if (!"BOTH".equals(bType) && !"BOTH".equals(branchType) && !bType.equals(branchType)) {
                combinedTypes = java.util.Collections.emptyList();
            } else if (!"BOTH".equals(bType)) {
                combinedTypes = java.util.Arrays.asList("BOTH", bType);
            }
            
            productPage = productRepository.findByIsActiveTrueAndBusinessTypeIn(combinedTypes, PageRequest.of(page, size));
        } else {
            productPage = productRepository.findByIsActiveTrueAndBusinessTypeIn(validTypes, PageRequest.of(page, size));
        }
        return PageResponse.of(productPage.map(this::mapToDto));
    }

    @Transactional(readOnly = true)
    @org.springframework.cache.annotation.Cacheable(value = "products", key = "#id")
    public ProductDto getProductById(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        return mapToDto(product);
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "products", allEntries = true)
    public ProductDto createProduct(ProductDto dto) {
        Product product = Product.builder()
                .name(dto.getName())
                .sku(dto.getSku())
                .type(dto.getType())
                .price(dto.getPrice())
                .cost(dto.getCost() != null ? dto.getCost() : java.math.BigDecimal.ZERO)
                .businessType(dto.getBusinessType() != null ? dto.getBusinessType() : "BOTH")
                .isActive(true)
                .build();
        final Product savedProduct = productRepository.save(product);

        if (dto.getStockQuantity() != null) {
            // Defaulting to branch 1 for now (assuming single branch)
            Branch branch = branchRepository.findById(1L).orElseThrow();
            Inventory inventory = Inventory.builder()
                    .product(savedProduct)
                    .branch(branch)
                    .quantity(dto.getStockQuantity())
                    .reorderLevel(10)
                    .build();
            inventoryRepository.save(inventory);

            InventoryTransaction transaction = InventoryTransaction.builder()
                    .product(savedProduct)
                    .branch(branch)
                    .changeQty(dto.getStockQuantity())
                    .type("RECEIPT")
                    .notes("Initial stock via product creation")
                    .build();
            inventoryTransactionRepository.save(transaction);
        }

        return mapToDto(savedProduct);
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "products", allEntries = true)
    public ProductDto updateProduct(Long id, ProductDto dto) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setName(dto.getName());
        product.setSku(dto.getSku());
        product.setType(dto.getType());
        product.setPrice(dto.getPrice());
        if (dto.getCost() != null) {
            product.setCost(dto.getCost());
        }
        if (dto.getBusinessType() != null) {
            product.setBusinessType(dto.getBusinessType());
        }
        final Product savedProduct = productRepository.save(product);
        
        if (dto.getStockQuantity() != null) {
            Branch branch = branchRepository.findById(1L).orElseThrow();
            Inventory inventory = inventoryRepository.findByProductIdAndBranchId(savedProduct.getId(), branch.getId())
                    .orElseGet(() -> Inventory.builder().product(savedProduct).branch(branch).quantity(0).reorderLevel(10).build());
            
            int diff = dto.getStockQuantity() - (inventory.getQuantity() != null ? inventory.getQuantity() : 0);
            if (diff != 0) {
                inventory.setQuantity(dto.getStockQuantity());
                inventoryRepository.save(inventory);
                
                InventoryTransaction transaction = InventoryTransaction.builder()
                        .product(savedProduct)
                        .branch(branch)
                        .changeQty(diff)
                        .type("ADJUSTMENT")
                        .notes("Manual stock adjustment via update")
                        .build();
                inventoryTransactionRepository.save(transaction);
            }
        }

        return mapToDto(savedProduct);
    }

    @Transactional
    @org.springframework.cache.annotation.CacheEvict(value = "products", allEntries = true)
    public void deleteProduct(Long id) {
        Product product = productRepository.findById(id)
                .orElseThrow(() -> new ResourceNotFoundException("Product not found"));
        product.setIsActive(false);
        productRepository.save(product);
    }

    private ProductDto mapToDto(Product product) {
        ProductDto dto = new ProductDto();
        dto.setId(product.getId());
        dto.setName(product.getName());
        dto.setSku(product.getSku());
        dto.setType(product.getType());
        dto.setPrice(product.getPrice());
        dto.setCost(product.getCost());
        dto.setIsActive(product.getIsActive());
        dto.setBusinessType(product.getBusinessType());

        inventoryRepository.findByProductIdAndBranchId(product.getId(), 1L).ifPresent(inventory -> {
            dto.setStockQuantity(inventory.getQuantity());
        });

        return dto;
    }
}
