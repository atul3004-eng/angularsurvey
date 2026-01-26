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
@Table(name = "answers")
public class Answers {

  @Id
  @GeneratedValue(strategy = GenerationType.IDENTITY)
  @Column(name = "id")
  private Long id;

  @ManyToOne
  @JoinColumn(name = "questionId")
  private Questions questionId;

  @ManyToOne
  @JoinColumn(name = "questionOptionsId")
  private QuestionsOptions questionOptionsId;

  @Column(name = "answer_text")
  private String answerText;

  @ManyToOne
  @JoinColumn(name = "respondant_id")
  private Respondant respondant;

  @Column(name = "selected_options")
  private String selectedOptions;

  public String getSelectedOptions() {
    return selectedOptions;
  }

  public void setSelectedOptions(String selectedOptions) {
    this.selectedOptions = selectedOptions;
  }

  public void setRespondant(Respondant respondant) {
    if (respondant != null) {
      if (respondant.getAnswers() == null) {
        respondant.setAnswers(new HashSet<>());
      }
      respondant.getAnswers().add(this);
    }
    this.respondant = respondant;
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

  public void setQuestionId(Questions questionId) {
    this.questionId = questionId;
  }

  public QuestionsOptions getQuestionOptionsId() {
    return questionOptionsId;
  }

  public void setQuestionOptionsId(QuestionsOptions questionOptionsId) {
    this.questionOptionsId = questionOptionsId;
  }

  public String getAnswerText() {
    return answerText;
  }

  public void setAnswerText(String answerText) {
    this.answerText = answerText;
  }

  public Respondant getRespondant() {
    return respondant;
  }
}
