import com.localservice.marketplace.entity.Category;
import com.localservice.marketplace.entity.User;
import com.localservice.marketplace.enums.Role;
import com.localservice.marketplace.repository.CategoryRepository;
import com.localservice.marketplace.repository.UserRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;
import org.springframework.security.crypto.password.PasswordEncoder;

import java.util.List;

@SpringBootApplication
public class LocalServiceMarketplaceApplication {

    public static void main(String[] args) {
        SpringApplication.run(LocalServiceMarketplaceApplication.class, args);
    }

    @Bean
    CommandLineRunner initializeCategories(CategoryRepository categoryRepository) {
        return args -> {

            List<String> categories = List.of(
                    "AC Repair",
                    "Plumbing",
                    "Electrical",
                    "Cleaning",
                    "Painting",
                    "Carpentry",
                    "Appliance Repair",
                    "Pest Control",
                    "Beauty & Salon",
                    "Moving & Shifting"
            );

            for (String categoryName : categories) {

                boolean exists = categoryRepository.findAll()
                        .stream()
                        .anyMatch(category ->
                                category.getName().equalsIgnoreCase(categoryName)
                        );

                if (!exists) {
                    Category category = Category.builder()
                            .name(categoryName)
                            .description(categoryName + " services")
                            .build();

                    categoryRepository.save(category);
                }
            }
        };
    }

    @Bean
    CommandLineRunner initializeAdmin(UserRepository userRepository, PasswordEncoder passwordEncoder) {
        return args -> {
            if (!userRepository.existsByRole(Role.ADMIN)) {
                User admin = User.builder()
                        .name("Admin")
                        .email("admin@serveconnect.com")
                        .password(passwordEncoder.encode("admin123"))
                        .phone("9999999999")
                        .role(Role.ADMIN)
                        .address("Admin HQ")
                        .isActive(true)
                        .build();

                userRepository.save(admin);
            }
        };
    }
}