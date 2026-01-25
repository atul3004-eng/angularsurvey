package com.mahendra.survey.config;

import com.mahendra.survey.dao.AdminRepository;
import com.mahendra.survey.dao.InputTypesRepository;
import com.mahendra.survey.entity.Admin;
import com.mahendra.survey.entity.InputTypes;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.Arrays;

@Component
public class SeedDataLoader implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private InputTypesRepository inputTypesRepository;

    @Autowired
    private Environment environment;

    @Override
    public void run(String... args) throws Exception {
        // Skip seeding if test profile is active
        if (Arrays.asList(environment.getActiveProfiles()).contains("test")) {
            return;
        }

        // Seed admin data
        if (adminRepository.count() == 0) {
            Admin admin = new Admin();
            admin.setEmail("m@m.com");
            admin.setFirstName("mahendra");
            admin.setLastName("bishnoi");
            admin.setIsPrimaryAdmin((short) 1);
            admin.setPassword("password"); // Note: In production, passwords should be hashed
            adminRepository.save(admin);
        }

        // Seed input types
        if (inputTypesRepository.count() == 0) {
            InputTypes radio = new InputTypes();
            radio.setInputTypeName("radio");
            inputTypesRepository.save(radio);

            InputTypes checkbox = new InputTypes();
            checkbox.setInputTypeName("checkbox_multiselect");
            inputTypesRepository.save(checkbox);

            InputTypes oneline = new InputTypes();
            oneline.setInputTypeName("oneline");
            inputTypesRepository.save(oneline);

            InputTypes multiline = new InputTypes();
            multiline.setInputTypeName("multiline");
            inputTypesRepository.save(multiline);
        }
    }
}