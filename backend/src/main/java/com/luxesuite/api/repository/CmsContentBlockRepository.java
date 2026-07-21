package com.luxesuite.api.repository;

import com.luxesuite.api.model.CmsContentBlock;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.util.List;
import java.util.Optional;

@Repository
public interface CmsContentBlockRepository extends JpaRepository<CmsContentBlock, Long> {
    List<CmsContentBlock> findByPageKey(String pageKey);
    Optional<CmsContentBlock> findByPageKeyAndBlockKey(String pageKey, String blockKey);
}
