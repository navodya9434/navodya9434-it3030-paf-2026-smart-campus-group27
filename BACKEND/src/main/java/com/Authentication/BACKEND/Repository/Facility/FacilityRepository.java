package com.Authentication.BACKEND.Repository.Facility;


import com.Authentication.BACKEND.Entity.Facility.FacilityEntity;
import com.Authentication.BACKEND.Entity.Facility.FacilityStatus;
import com.Authentication.BACKEND.Entity.Facility.FacilityType;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.data.jpa.repository.Query;
import org.springframework.data.repository.query.Param;

import java.util.List;
import java.util.Optional;

public interface FacilityRepository extends JpaRepository<FacilityEntity, Long> {
    Optional<FacilityEntity> findByName(String name);

    List<FacilityEntity> findByType(FacilityType type);

    List<FacilityEntity> findByLocation(String location);

    List<FacilityEntity> findByStatus(FacilityStatus status);

    List<FacilityEntity> findByCapacityGreaterThanEqual(Integer capacity);

    @Query("SELECT f FROM FacilityEntity f WHERE f.status = :status AND f.type = :type")
    List<FacilityEntity> findByStatusAndType(@Param("status") FacilityStatus status, @Param("type") FacilityType type);

    @Query("SELECT f FROM FacilityEntity f WHERE f.location LIKE %:location% AND f.status = :status")
    List<FacilityEntity> findByLocationAndStatus(@Param("location") String location, @Param("status") FacilityStatus status);

    @Query("SELECT f FROM FacilityEntity f WHERE " +
            "(LOWER(f.name) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(f.description) LIKE LOWER(CONCAT('%', :searchTerm, '%')) OR " +
            "LOWER(f.location) LIKE LOWER(CONCAT('%', :searchTerm, '%')))")
    List<FacilityEntity> searchFacilities(@Param("searchTerm") String searchTerm);

    @Query("SELECT f FROM FacilityEntity f WHERE f.status = :status")
    List<FacilityEntity> findAllActive(@Param("status") FacilityStatus status);

    @Query("SELECT f FROM FacilityEntity f WHERE f.type = :type AND f.status = :status AND f.capacity >= :minCapacity ORDER BY f.capacity ASC")
    List<FacilityEntity> findSuitableFacilities(@Param("type") FacilityType type,
                                                @Param("status") FacilityStatus status,
                                                @Param("minCapacity") Integer minCapacity);

    boolean existsByName(String name);

}

