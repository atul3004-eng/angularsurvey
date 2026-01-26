package com.mahendra.survey.entity;

import java.util.HashSet;
import jakarta.persistence.Column;
import jakarta.persistence.Entity;
import jakarta.persistence.GeneratedValue;
import jakarta.persistence.GenerationType;
import jakarta.persistence.Id;
import jakarta.persistence.JoinColumn;
import jakarta.persistence.ManyToOne;
import jakarta.persistence.Table;

@Entity
@Table(name = "question_options")
public class QuestionsOptions {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Long id;

  @ManyToOne
  @JoinColumn(name = "questionId")
  private Questions questionId;

  @Column(name = "option_name")
  private String optionName;

  public void setQuestionId(Questions questionId) {
    if (questionId != null) {
      if (questionId.getQuestionsOptions() == null) {
        questionId.setQuestionsOptions(new HashSet<>());
      }
      questionId.getQuestionsOptions().add(this);
    }
    this.questionId = questionId;
  }

  public Long getId() {
    return id;
  }

  public void setId(Long id) {
    this.id = id;
  }

  public Questions getQuestionId() {
    return questionId;
  }

  public String getOptionName() {
    return optionName;
  }

  public void setOptionName(String optionName) {
    this.optionName = optionName;
  }
}
