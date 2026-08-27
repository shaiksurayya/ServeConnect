package com.localservice.marketplace.service;

import com.localservice.marketplace.dto.request.CategoryRequestDTO;
import com.localservice.marketplace.dto.response.*;
import com.localservice.marketplace.entity.*;
import com.localservice.marketplace.enums.BookingStatus;
import com.localservice.marketplace.enums.Role;
import com.localservice.marketplace.repository.*;
import com.localservice.marketplace.service.impl.AdminServiceImpl;
import org.junit.jupiter.api.BeforeEach;
import org.junit.jupiter.api.Test;
import org.junit.jupiter.api.extension.ExtendWith;
import org.mockito.InjectMocks;
import org.mockito.Mock;
import org.mockito.junit.jupiter.MockitoExtension;

import java.math.BigDecimal;
import java.time.LocalDate;
import java.time.LocalDateTime;
import java.time.LocalTime;
import java.util.List;
import java.util.Optional;

import static org.junit.jupiter.api.Assertions.*;
import static org.mockito.ArgumentMatchers.any;
import static org.mockito.Mockito.*;

@ExtendWith(MockitoExtension.class)
class AdminServiceImplTest {

    @Mock
    private UserRepository userRepository;

    @Mock
    private ProviderProfileRepository providerProfileRepository;

    @Mock
    private ServiceRepository serviceRepository;

    @Mock
    private CategoryRepository categoryRepository;

    @Mock
    private BookingRepository bookingRepository;

    @Mock
    private ReviewRepository reviewRepository;

    @InjectMocks
    private AdminServiceImpl adminService;

    private User customer;
    private User providerUser;
    private ProviderProfile providerProfile;
    private com.localservice.marketplace.entity.Service service;
    private Booking booking;
    private Review review;
    private Category category;

    @BeforeEach
    void setUp() {
        customer = User.builder()
                .userId(1L)
                .name("John Customer")
                .email("john@example.com")
                .role(Role.CUSTOMER)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        providerUser = User.builder()
                .userId(2L)
                .name("Jane Provider")
                .email("jane@example.com")
                .role(Role.PROVIDER)
                .isActive(true)
                .createdAt(LocalDateTime.now())
                .build();

        providerProfile = ProviderProfile.builder()
                .providerId(10L)
                .user(providerUser)
                .isVerified(false)
                .avgRating(BigDecimal.valueOf(4.5))
                .build();

        category = Category.builder()
                .categoryId(100L)
                .name("Plumbing")
                .description("Plumbing services")
                .build();

        service = com.localservice.marketplace.entity.Service.builder()
                .serviceId(200L)
                .title("Pipe Repair")
                .provider(providerProfile)
                .category(category)
                .price(BigDecimal.valueOf(500))
                .availability(true)
                .build();

        booking = Booking.builder()
                .bookingId(300L)
                .customer(customer)
                .provider(providerProfile)
                .service(service)
                .bookingDate(LocalDate.now())
                .bookingTime(LocalTime.of(10, 0))
                .address("123 Main St")
                .totalAmount(BigDecimal.valueOf(500))
                .status(BookingStatus.COMPLETED)
                .paymentMethod("CASH_ON_SERVICE")
                .createdAt(LocalDateTime.now())
                .build();

        review = Review.builder()
                .reviewId(400L)
                .customer(customer)
                .provider(providerProfile)
                .booking(booking)
                .rating(5)
                .comment("Great service")
                .createdAt(LocalDateTime.now())
                .build();
    }

    @Test
    void testGetDashboardStats() {
        when(userRepository.count()).thenReturn(10L);
        when(userRepository.countByRole(Role.CUSTOMER)).thenReturn(7L);
        when(providerProfileRepository.count()).thenReturn(3L);
        when(serviceRepository.count()).thenReturn(5L);
        when(categoryRepository.count()).thenReturn(4L);
        when(bookingRepository.count()).thenReturn(20L);
        when(bookingRepository.findAll()).thenReturn(List.of(booking));
        when(reviewRepository.count()).thenReturn(15L);
        when(reviewRepository.findAll()).thenReturn(List.of(review));
        when(userRepository.findAll()).thenReturn(List.of(customer, providerUser));

        AdminDashboardResponse stats = adminService.getDashboardStats();

        assertNotNull(stats);
        assertEquals(10L, stats.getTotalUsers());
        assertEquals(7L, stats.getTotalCustomers());
        assertEquals(3L, stats.getTotalProviders());
        assertEquals(5L, stats.getTotalServices());
        assertEquals(4L, stats.getTotalCategories());
        assertEquals(20L, stats.getTotalBookings());
        assertEquals(1L, stats.getCompletedBookings());
        assertEquals(BigDecimal.valueOf(500), stats.getTotalCompletedRevenue());
        assertEquals(1, stats.getRecentBookings().size());
        assertEquals(1, stats.getRecentReviews().size());
    }

    @Test
    void testToggleUserStatus() {
        when(userRepository.findById(1L)).thenReturn(Optional.of(customer));
        when(userRepository.save(any(User.class))).thenAnswer(invocation -> invocation.getArgument(0));

        UserResponseDTO result = adminService.toggleUserStatus(1L, false);

        assertNotNull(result);
        assertFalse(result.getIsActive());
        verify(userRepository).save(customer);
    }

    @Test
    void testToggleProviderVerification() {
        when(providerProfileRepository.findById(10L)).thenReturn(Optional.of(providerProfile));
        when(providerProfileRepository.save(any(ProviderProfile.class))).thenAnswer(invocation -> invocation.getArgument(0));

        ProviderProfileResponseDTO result = adminService.toggleProviderVerification(10L, true);

        assertNotNull(result);
        assertTrue(result.getIsVerified());
    }

    @Test
    void testCategoryCRUD() {
        when(categoryRepository.findAll()).thenReturn(List.of(category));
        when(categoryRepository.save(any(Category.class))).thenAnswer(invocation -> invocation.getArgument(0));

        CategoryRequestDTO request = CategoryRequestDTO.builder()
                .name("Electrical")
                .description("Electrical repair")
                .build();

        Category created = adminService.createCategory(request);
        assertNotNull(created);
        assertEquals("Electrical", created.getName());

        when(categoryRepository.findById(100L)).thenReturn(Optional.of(category));
        CategoryRequestDTO updateReq = CategoryRequestDTO.builder()
                .name("Plumbing & Drains")
                .description("Updated plumbing")
                .build();

        Category updated = adminService.updateCategory(100L, updateReq);
        assertEquals("Plumbing & Drains", updated.getName());

        when(categoryRepository.existsById(100L)).thenReturn(true);
        adminService.deleteCategory(100L);
        verify(categoryRepository).deleteById(100L);
    }

    @Test
    void testDeleteReview() {
        when(reviewRepository.existsById(400L)).thenReturn(true);
        adminService.deleteReview(400L);
        verify(reviewRepository).deleteById(400L);
    }
}
