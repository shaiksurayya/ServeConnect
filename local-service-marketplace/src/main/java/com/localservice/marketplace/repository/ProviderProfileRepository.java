// package com.localservice.marketplace.repository;

// import com.localservice.marketplace.entity.ProviderProfile;
// import org.springframework.data.jpa.repository.JpaRepository;
// import org.springframework.stereotype.Repository;

// import java.math.BigDecimal;
// import java.util.List;
// import java.util.Optional;

// @Repository
// public interface ProviderProfileRepository extends JpaRepository<ProviderProfile, Long> {

//     List<ProviderProfile> findByAvgRatingGreaterThanEqual(BigDecimal rating);

//     List<ProviderProfile> findByIsVerifiedTrue();

//     Optional<ProviderProfile> findByUser_UserId(Long userId);
// }







package com.localservice.marketplace.repository;

import com.localservice.marketplace.entity.ProviderProfile;
import org.springframework.data.jpa.repository.JpaRepository;
import org.springframework.stereotype.Repository;

import java.math.BigDecimal;
import java.util.List;

@Repository
public interface ProviderProfileRepository extends JpaRepository<ProviderProfile, Long> {

    List<ProviderProfile> findByAvgRatingGreaterThanEqual(BigDecimal rating);

    List<ProviderProfile> findByIsVerifiedTrue();
}