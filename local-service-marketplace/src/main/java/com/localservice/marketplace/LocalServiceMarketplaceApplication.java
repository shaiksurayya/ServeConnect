package com.localservice.marketplace;

import com.localservice.marketplace.entity.Category;
import com.localservice.marketplace.repository.CategoryRepository;
import org.springframework.boot.CommandLineRunner;
import org.springframework.boot.SpringApplication;
import org.springframework.boot.autoconfigure.SpringBootApplication;
import org.springframework.context.annotation.Bean;

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
}