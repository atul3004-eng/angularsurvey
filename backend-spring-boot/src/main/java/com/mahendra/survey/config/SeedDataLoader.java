package com.mahendra.survey.config;

import com.mahendra.survey.dao.AdminRepository;
import com.mahendra.survey.dao.InputTypesRepository;
import com.mahendra.survey.dao.SurveyHeaderRepository;
import com.mahendra.survey.entity.Admin;
import com.mahendra.survey.entity.InputTypes;
import com.mahendra.survey.response.Option;
import com.mahendra.survey.response.Question;
import com.mahendra.survey.response.SurveyFull;
import com.mahendra.survey.response.Type;
import com.mahendra.survey.service.SurveyService;
import org.springframework.beans.factory.annotation.Autowired;
import org.springframework.boot.CommandLineRunner;
import org.springframework.core.env.Environment;
import org.springframework.stereotype.Component;

import java.util.ArrayList;
import java.util.Arrays;
import java.util.Calendar;
import java.util.Date;
import java.util.List;

@Component
public class SeedDataLoader implements CommandLineRunner {

    @Autowired
    private AdminRepository adminRepository;

    @Autowired
    private InputTypesRepository inputTypesRepository;

    @Autowired
    private SurveyHeaderRepository surveyHeaderRepository;

    @Autowired
    private SurveyService surveyService;

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

        // Seed a demo survey so the UI has usable sample data when it is missing
        boolean sampleSurveyMissing = surveyHeaderRepository.findAll().stream()
                .noneMatch(survey -> "Developer Background Survey".equalsIgnoreCase(survey.getSurveyName()));

        if (sampleSurveyMissing) {
            surveyService.saveSurvey(buildSampleSurvey());
        }
    }

    private SurveyFull buildSampleSurvey() {
        SurveyFull survey = new SurveyFull();
        survey.setName("Developer Background Survey");
        survey.setDescription("Sample survey for testing survey creation, question rendering, and response collection.");
        survey.setCreated(new Date());

        Calendar calendar = Calendar.getInstance();
        calendar.add(Calendar.DAY_OF_YEAR, 365);
        survey.setValidTill(calendar.getTime());

        List<Question> questions = new ArrayList<>();
        questions.add(createQuestion(
                "What is your age group?",
                "radio",
                "required",
                "Under 18",
                "18-24",
                "25-34",
                "35-44",
                "45+"));
        questions.add(createQuestion(
                "What is your gender?",
                "radio",
                "required",
                "Male",
                "Female",
                "Prefer not to say"));
        questions.add(createQuestion(
                "What is your highest qualification?",
                "radio",
                "required",
                "High School",
                "Diploma",
                "Bachelor's Degree",
                "Master's Degree",
                "Doctorate"));
        questions.add(createQuestion(
                "Which programming languages do you know?",
                "checkbox_multiselect",
                "optional",
                "Java",
                "JavaScript",
                "TypeScript",
                "Python",
                "C#",
                "C++",
                "Go"));

        survey.setQuestions(questions);
        return survey;
    }

    private Question createQuestion(String questionText, String typeName, String validation, String... optionNames) {
        Question question = new Question();
        question.setQuestion(questionText);
        question.setValidation(validation);

        Type type = new Type();
        type.setTypeName(typeName);
        question.setType(type);

        List<Option> options = new ArrayList<>();
        for (String optionName : optionNames) {
            Option option = new Option();
            option.setName(optionName);
            options.add(option);
        }
        question.setOptions(options);
        return question;
    }
}
