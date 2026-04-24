(function () {
  "use strict";

  angular
    .module("surveyLegacyApp", ["ngRoute"])
    .constant("APP_CONFIG", {
      apiBase: "/api",
      storageKey: "surveyLegacyAdmin"
    })
    .config(configureRoutes)
    .factory("ApiService", ApiService)
    .factory("AuthService", AuthService)
    .factory("FlashService", FlashService)
    .controller("AppController", AppController)
    .controller("LoginController", LoginController)
    .controller("AdminController", AdminController)
    .controller("CreateSurveyController", CreateSurveyController)
    .controller("AddAdminController", AddAdminController)
    .controller("SurveyDetailsController", SurveyDetailsController)
    .controller("TakeSurveyController", TakeSurveyController)
    .controller("SurveyCompleteController", SurveyCompleteController)
    .filter("questionTypeLabel", questionTypeLabelFilter);

  configureRoutes.$inject = ["$routeProvider", "$locationProvider"];
  function configureRoutes($routeProvider, $locationProvider) {
    $locationProvider.hashPrefix("");

    $routeProvider
      .when("/login", {
        templateUrl: "app/templates/login.html",
        controller: "LoginController",
        controllerAs: "vm"
      })
      .when("/admin", {
        templateUrl: "app/templates/admin.html",
        controller: "AdminController",
        controllerAs: "vm",
        resolve: {
          auth: requireAuth
        }
      })
      .when("/createSurvey", {
        templateUrl: "app/templates/create-survey.html",
        controller: "CreateSurveyController",
        controllerAs: "vm",
        resolve: {
          auth: requireAuth
        }
      })
      .when("/addAdmin", {
        templateUrl: "app/templates/add-admin.html",
        controller: "AddAdminController",
        controllerAs: "vm",
        resolve: {
          auth: requireAuth
        }
      })
      .when("/surveyDetails/:id", {
        templateUrl: "app/templates/survey-details.html",
        controller: "SurveyDetailsController",
        controllerAs: "vm",
        resolve: {
          auth: requireAuth
        }
      })
      .when("/takeSurvey/:id", {
        templateUrl: "app/templates/take-survey.html",
        controller: "TakeSurveyController",
        controllerAs: "vm"
      })
      .when("/surveycompleted", {
        templateUrl: "app/templates/survey-complete.html",
        controller: "SurveyCompleteController",
        controllerAs: "vm"
      })
      .otherwise({
        redirectTo: "/login"
      });
  }

  requireAuth.$inject = ["AuthService", "$location", "$q"];
  function requireAuth(AuthService, $location, $q) {
    if (AuthService.isLoggedIn()) {
      return true;
    }
    $location.path("/login");
    return $q.reject("AUTH_REQUIRED");
  }

  ApiService.$inject = ["$http", "APP_CONFIG"];
  function ApiService($http, APP_CONFIG) {
    return {
      getSurveyList: function () {
        return $http.get(APP_CONFIG.apiBase + "/surveys/getAll").then(unwrapData);
      },
      getSurvey: function (surveyId) {
        return $http.get(APP_CONFIG.apiBase + "/surveys/" + surveyId).then(unwrapData);
      },
      getSurveyResponses: function (surveyId) {
        return $http.get(APP_CONFIG.apiBase + "/surveys/responses/" + surveyId).then(unwrapData);
      },
      getSurveyRespondents: function (surveyId) {
        return $http
          .get(APP_CONFIG.apiBase + "/surveys/" + surveyId + "/respondants")
          .then(function (response) {
            return (response.data && response.data._embedded && response.data._embedded.respondants) || [];
          });
      },
      verifyLogin: function (admin) {
        return $http.post(APP_CONFIG.apiBase + "/login", admin).then(unwrapData);
      },
      addAdmin: function (admin) {
        return $http.post(APP_CONFIG.apiBase + "/admin/add", admin).then(unwrapData);
      },
      deleteSurvey: function (surveyId) {
        return $http.post(APP_CONFIG.apiBase + "/surveys/delete", surveyId).then(unwrapData);
      },
      verifyUser: function (surveyId, respondent) {
        return $http.post(APP_CONFIG.apiBase + "/respondant/new/" + surveyId, respondent).then(unwrapData);
      },
      saveSurveyResponse: function (payload) {
        return $http.post(APP_CONFIG.apiBase + "/surveys/response", payload).then(unwrapData);
      },
      saveNewSurvey: function (payload) {
        return $http.post(APP_CONFIG.apiBase + "/surveys/create", payload).then(unwrapData);
      }
    };
  }

  AuthService.$inject = ["$window", "APP_CONFIG"];
  function AuthService($window, APP_CONFIG) {
    return {
      login: function (admin) {
        $window.localStorage.setItem(APP_CONFIG.storageKey, angular.toJson(admin));
      },
      logout: function () {
        $window.localStorage.removeItem(APP_CONFIG.storageKey);
      },
      getAdmin: function () {
        var raw = $window.localStorage.getItem(APP_CONFIG.storageKey);
        return raw ? angular.fromJson(raw) : null;
      },
      isLoggedIn: function () {
        return !!this.getAdmin();
      }
    };
  }

  function FlashService() {
    var state = {
      success: "",
      error: ""
    };

    return {
      setSuccess: function (message) {
        state.success = message || "";
        state.error = "";
      },
      setError: function (message) {
        state.error = message || "";
        state.success = "";
      },
      clear: function () {
        state.success = "";
        state.error = "";
      },
      success: function () {
        return state.success;
      },
      error: function () {
        return state.error;
      }
    };
  }

  AppController.$inject = ["$location", "AuthService", "FlashService"];
  function AppController($location, AuthService, FlashService) {
    var vm = this;

    vm.isLoggedIn = function () {
      return AuthService.isLoggedIn();
    };

    vm.adminName = function () {
      var admin = AuthService.getAdmin();
      if (!admin) {
        return "";
      }
      return [admin.firstName, admin.lastName].join(" ").trim() || admin.email;
    };

    vm.showAdminNav = function () {
      return AuthService.isLoggedIn() && /^\/(admin|createSurvey|addAdmin|surveyDetails)/.test($location.path());
    };

    vm.isPath = function (path) {
      return $location.path() === path;
    };

    vm.logout = function () {
      AuthService.logout();
      FlashService.setSuccess("You have been logged out.");
      $location.path("/login");
    };

    vm.successMessage = FlashService.success;
    vm.errorMessage = FlashService.error;
  }

  LoginController.$inject = ["$location", "ApiService", "AuthService", "FlashService"];
  function LoginController($location, ApiService, AuthService, FlashService) {
    var vm = this;

    vm.form = {
      email: "",
      password: ""
    };
    vm.submitted = false;
    vm.loading = false;
    vm.error = "";

    if (AuthService.isLoggedIn()) {
      $location.path("/admin");
      return;
    }

    FlashService.clear();

    vm.login = function (form) {
      vm.submitted = true;
      vm.error = "";

      if (form.$invalid) {
        return;
      }

      vm.loading = true;
      ApiService.verifyLogin({
        email: vm.form.email,
        password: vm.form.password
      })
        .then(function (data) {
          if (data && data.id !== -1) {
            AuthService.login(data);
            FlashService.setSuccess("Welcome back.");
            $location.path("/admin");
            return;
          }
          vm.error = "Invalid user name or password.";
        })
        .catch(function () {
          vm.error = "Login failed. Check backend connectivity and try again.";
        })
        .finally(function () {
          vm.loading = false;
        });
    };
  }

  AdminController.$inject = ["ApiService", "FlashService", "$window"];
  function AdminController(ApiService, FlashService, $window) {
    var vm = this;

    vm.surveys = [];
    vm.loading = true;
    vm.error = "";

    vm.loadSurveys = function () {
      vm.loading = true;
      vm.error = "";
      ApiService.getSurveyList()
        .then(function (surveys) {
          vm.surveys = surveys || [];
        })
        .catch(function () {
          vm.error = "Unable to load surveys.";
        })
        .finally(function () {
          vm.loading = false;
        });
    };

    vm.copyLink = function (surveyId) {
      var link = $window.location.origin + "/#/takeSurvey/" + surveyId;
      copyText(link);
      FlashService.setSuccess("Survey link copied to clipboard.");
    };

    vm.deleteSurvey = function (surveyId) {
      if (!$window.confirm("Delete this survey?")) {
        return;
      }

      ApiService.deleteSurvey(surveyId)
        .then(function () {
          FlashService.setSuccess("Survey deleted.");
          vm.loadSurveys();
        })
        .catch(function () {
          FlashService.setError("Unable to delete the survey.");
        });
    };

    vm.takeSurveyLink = function (surveyId) {
      return "#/takeSurvey/" + surveyId;
    };

    vm.detailsLink = function (surveyId) {
      return "#/surveyDetails/" + surveyId;
    };

    vm.loadSurveys();
  }

  CreateSurveyController.$inject = ["ApiService", "FlashService", "$window"];
  function CreateSurveyController(ApiService, FlashService, $window) {
    var vm = this;

    vm.maxQuestions = 5;
    vm.questionTypes = [
      { value: "oneline", label: "Single Line Answer" },
      { value: "multiline", label: "Multiple Line Answer" },
      { value: "radio", label: "Radio Button" },
      { value: "checkbox_multiselect", label: "Checkbox Type" }
    ];
    vm.validationTypes = [
      { value: "", label: "No Validation" },
      { value: "alpha", label: "Alphabets Only" },
      { value: "alpha-numeric", label: "Alpha Numeric Values" },
      { value: "numeric", label: "Numbers Only" }
    ];
    vm.resetDraft = resetDraft;
    vm.resetForm = resetForm;
    vm.resetForm();

    function resetForm() {
      vm.survey = {
        surveyName: "",
        validTill: "",
        description: ""
      };
      vm.questions = [];
      vm.createdSurvey = null;
      vm.isSubmitting = false;
      vm.submitError = "";
      resetDraft();
    }

    function resetDraft() {
      vm.draftQuestion = {
        question: "",
        questionType: "oneline",
        validation: "",
        newOption: "",
        options: []
      };
      vm.questionError = "";
    }

    vm.needsOptions = function () {
      return vm.draftQuestion.questionType === "radio" || vm.draftQuestion.questionType === "checkbox_multiselect";
    };

    vm.addOption = function () {
      var option = (vm.draftQuestion.newOption || "").trim();
      if (!option) {
        return;
      }
      if (vm.draftQuestion.options.indexOf(option) !== -1) {
        vm.questionError = "This option is already present.";
        return;
      }
      vm.questionError = "";
      vm.draftQuestion.options.push(option);
      vm.draftQuestion.newOption = "";
    };

    vm.removeOption = function (index) {
      vm.draftQuestion.options.splice(index, 1);
    };

    vm.addQuestion = function (form) {
      vm.questionError = "";
      if (form.$invalid) {
        return;
      }
      if (vm.needsOptions() && vm.draftQuestion.options.length < 2) {
        vm.questionError = "Please add at least 2 options.";
        return;
      }
      vm.questions.push({
        question: vm.draftQuestion.question,
        questionType: vm.draftQuestion.questionType,
        validation: vm.needsOptions() ? "" : vm.draftQuestion.validation,
        options: angular.copy(vm.draftQuestion.options)
      });
      resetDraft();
      form.$setPristine();
      form.$setUntouched();
    };

    vm.removeQuestion = function (index) {
      vm.questions.splice(index, 1);
    };

    vm.createSurvey = function (form) {
      vm.submitError = "";
      if (form.$invalid || vm.questions.length === 0) {
        return;
      }

      vm.isSubmitting = true;
      ApiService.saveNewSurvey(buildSurveyPayload())
        .then(function (data) {
          vm.createdSurvey = data;
          vm.createdSurvey.link = $window.location.origin + "/#/takeSurvey/" + data.id;
          FlashService.setSuccess("Survey created successfully.");
        })
        .catch(function (error) {
          var status = error && error.status ? " (status " + error.status + ")" : "";
          vm.submitError = "Failed to create survey" + status + ".";
        })
        .finally(function () {
          vm.isSubmitting = false;
        });
    };

    vm.copyCreatedLink = function () {
      if (!vm.createdSurvey || !vm.createdSurvey.link) {
        return;
      }
      copyText(vm.createdSurvey.link);
      FlashService.setSuccess("Survey link copied to clipboard.");
    };

    function buildSurveyPayload() {
      return {
        id: 0,
        created: new Date(),
        name: vm.survey.surveyName,
        validTill: new Date(vm.survey.validTill),
        description: vm.survey.description,
        questions: vm.questions.map(function (question, index) {
          return {
            id: index,
            question: question.question,
            type: {
              id: 0,
              typeName: question.questionType
            },
            validation: question.validation || "",
            options: (question.options || []).map(function (option, optionIndex) {
              return {
                id: optionIndex,
                name: option
              };
            })
          };
        })
      };
    }
  }

  AddAdminController.$inject = ["ApiService", "FlashService"];
  function AddAdminController(ApiService, FlashService) {
    var vm = this;

    vm.form = {
      firstName: "",
      lastName: "",
      email: "",
      password: "",
      isPrimaryAdmin: 1
    };
    vm.submitted = false;
    vm.loading = false;
    vm.added = false;
    vm.error = "";

    vm.addAdmin = function (form) {
      vm.submitted = true;
      vm.error = "";
      if (form.$invalid) {
        return;
      }
      vm.loading = true;
      ApiService.addAdmin(angular.copy(vm.form))
        .then(function () {
          vm.added = true;
          FlashService.setSuccess("Admin added successfully.");
        })
        .catch(function () {
          vm.error = "Unable to add the admin.";
        })
        .finally(function () {
          vm.loading = false;
        });
    };
  }

  SurveyDetailsController.$inject = ["$routeParams", "$q", "ApiService", "FlashService"];
  function SurveyDetailsController($routeParams, $q, ApiService, FlashService) {
    var vm = this;

    vm.surveyId = Number($routeParams.id);
    vm.loading = true;
    vm.error = "";
    vm.respondents = [];
    vm.filteredRespondents = [];
    vm.responses = [];
    vm.survey = null;
    vm.filterStart = "";
    vm.filterEnd = "";

    vm.applyDateFilter = function () {
      if (!vm.filterStart || !vm.filterEnd) {
        vm.filteredRespondents = vm.respondents.slice();
        return;
      }
        var start = dateOnly(vm.filterStart);
        var end = dateOnly(vm.filterEnd);
      vm.filteredRespondents = vm.respondents.filter(function (respondent) {
        var takenOn = dateOnly(respondent.takenOn);
        return takenOn >= start && takenOn <= end;
      });
    };

    vm.downloadJson = function (field) {
      downloadFile(JSON.stringify(getDataSet(field), null, 2), field + ".json", "application/json");
    };

    vm.downloadCsv = function (field) {
      downloadFile(toCsv(getDataSet(field)), field + ".csv", "text/csv;charset=utf-8");
    };

    vm.downloadXlsx = function (field) {
      if (typeof XLSX === "undefined") {
        FlashService.setError("XLSX export library is not available.");
        return;
      }
      var workbook = XLSX.utils.book_new();
      var worksheet = XLSX.utils.json_to_sheet(getDataSet(field));
      XLSX.utils.book_append_sheet(workbook, worksheet, field);
      XLSX.writeFile(workbook, field + ".xlsx");
    };

    vm.summaryCards = function () {
      if (!vm.survey) {
        return [];
      }
      return [
        { label: "Questions", value: vm.survey.questions.length },
        { label: "Responses", value: vm.filteredRespondents.length },
        { label: "Survey ID", value: vm.survey.id }
      ];
    };

    function getDataSet(field) {
      if (field === "details") {
        return [{
          "Survey Name": vm.survey ? vm.survey.name : "",
          "Survey Description": vm.survey ? vm.survey.description : "",
          "Number of Questions": vm.survey ? vm.survey.questions.length : 0,
          "Number of Responses": vm.filteredRespondents.length,
          "Created On": vm.survey ? vm.survey.created : "",
          "Valid Till": vm.survey ? vm.survey.validTill : ""
        }];
      }
      if (field === "respondents") {
        return vm.filteredRespondents.map(function (respondent) {
          return {
            Name: respondent.fullName,
            Email: respondent.email,
            "Submission Date": respondent.takenOn
          };
        });
      }
      return (vm.responses || []).map(function (response) {
        var row = {
          Name: response.fullName,
          Email: response.email
        };
        angular.forEach(response.questions, function (question, index) {
          row[question] = response.answers[index];
        });
        return row;
      });
    }

    $q
      .all({
        survey: ApiService.getSurvey(vm.surveyId),
        respondents: ApiService.getSurveyRespondents(vm.surveyId),
        responses: ApiService.getSurveyResponses(vm.surveyId)
      })
      .then(function (result) {
        vm.survey = result.survey;
        vm.respondents = result.respondents || [];
        vm.responses = result.responses || [];
        vm.filterStart = dateOnly(vm.survey.created);
        vm.filterEnd = dateOnly(vm.survey.validTill);
        vm.applyDateFilter();
      })
      .catch(function () {
        vm.error = "Unable to load survey details.";
      })
      .finally(function () {
        vm.loading = false;
      });
  }

  TakeSurveyController.$inject = ["$location", "$routeParams", "ApiService", "AuthService"];
  function TakeSurveyController($location, $routeParams, ApiService, AuthService) {
    var vm = this;

    AuthService.logout();

    vm.surveyId = Number($routeParams.id);
    vm.survey = null;
    vm.loading = true;
    vm.error = "";
    vm.message = "";
    vm.respondentSubmitted = false;
    vm.questionsSubmitted = false;
    vm.personalStepComplete = false;
    vm.personalDetails = {
      fullName: "",
      email: ""
    };
    vm.questions = [];
    vm.surveyExpired = false;

    vm.startSurvey = function (form) {
      vm.respondentSubmitted = true;
      vm.message = "";

      if (form.$invalid || !vm.survey || vm.surveyExpired) {
        return;
      }

      ApiService.verifyUser(vm.surveyId, {
        fullName: vm.personalDetails.fullName,
        email: vm.personalDetails.email,
        submitDate: new Date()
      })
        .then(function (alreadyResponded) {
          if (alreadyResponded) {
            vm.message = "You have already taken this survey.";
            return;
          }
          vm.personalStepComplete = true;
        })
        .catch(function () {
          vm.message = "Unable to verify respondent details.";
        });
    };

    vm.isQuestionValid = function (question) {
      if (!isRequired(question) && isQuestionEmpty(question)) {
        return true;
      }

      if (question.controlType === "radio") {
        return !!question.selectedOptionId;
      }
      if (question.controlType === "checkbox") {
        return question.options.some(function (option) {
          return !!option.checked;
        });
      }
      return !!question.answer && validationPasses(question.answer, question.validation);
    };

    vm.submitSurvey = function () {
      vm.questionsSubmitted = true;
      vm.message = "";

      var hasInvalidQuestion = vm.questions.some(function (question) {
        return !vm.isQuestionValid(question);
      });

      if (hasInvalidQuestion) {
        return;
      }

      ApiService.saveSurveyResponse(buildResponsePayload())
        .then(function () {
          $location.path("/surveycompleted");
        })
        .catch(function () {
          vm.message = "Failed to save the survey response.";
        });
    };

    ApiService.getSurvey(vm.surveyId)
      .then(function (survey) {
        vm.survey = survey;
        vm.surveyExpired = isExpired(survey.validTill);
        vm.questions = buildQuestionModels(survey.questions || []);
      })
      .catch(function () {
        vm.error = "Unable to load this survey.";
      })
      .finally(function () {
        vm.loading = false;
      });

    function buildResponsePayload() {
      return {
        id: vm.survey.id,
        fullName: vm.personalDetails.fullName,
        email: vm.personalDetails.email,
        submitDate: new Date(),
        answers: vm.questions.map(function (question) {
          var answerText = "";
          var selectedOptionIds = "";

          if (question.controlType === "radio") {
            selectedOptionIds = String(question.selectedOptionId);
            answerText = optionName(question.options, question.selectedOptionId);
          } else if (question.controlType === "checkbox") {
            var selected = question.options.filter(function (option) {
              return option.checked;
            });
            selectedOptionIds = selected.map(function (option) {
              return String(option.id);
            }).join(" ");
            answerText = selected.map(function (option) {
              return option.name;
            }).join(" | ");
          } else {
            answerText = question.answer;
          }

          return {
            questionId: question.id,
            questionText: question.label,
            questionTypeText: question.controlType,
            answerText: answerText,
            selectedOptionIds: selectedOptionIds
          };
        })
      };
    }
  }

  function SurveyCompleteController() {}

  function questionTypeLabelFilter() {
    return function (type) {
      var labels = {
        oneline: "Single Line Answer",
        multiline: "Multiple Line Answer",
        radio: "Radio Button",
        checkbox_multiselect: "Checkbox Type"
      };
      return labels[type] || type;
    };
  }

  function unwrapData(response) {
    return response.data;
  }

  function buildQuestionModels(questions) {
    return questions.map(function (question) {
      var controlType = question.type && question.type.typeName === "checkbox_multiselect"
        ? "checkbox"
        : (question.type ? question.type.typeName : "oneline");

      var options = (question.options || []).map(function (option) {
        return {
          id: option.id,
          name: option.name,
          checked: false
        };
      });

        return {
          id: question.id,
          label: question.question,
          validation: question.validation || "",
          controlType: controlType,
          answer: "",
          selectedOptionId: null,
          options: options
        };
      });
  }

  function isRequired(question) {
    return (question.validation || "").toLowerCase() !== "optional";
  }

  function isQuestionEmpty(question) {
    if (question.controlType === "radio") {
      return !question.selectedOptionId;
    }
    if (question.controlType === "checkbox") {
      return !question.options.some(function (option) {
        return !!option.checked;
      });
    }
    return !question.answer;
  }

  function optionName(options, selectedId) {
    var idx;
    for (idx = 0; idx < (options || []).length; idx += 1) {
      if (String(options[idx].id) === String(selectedId)) {
        return options[idx].name;
      }
    }
    return "";
  }

  function validationPasses(value, validation) {
    if (!validation) {
      return true;
    }
    if (validation === "alpha") {
      return /^[a-zA-Z ]+$/.test(value);
    }
    if (validation === "numeric") {
      return /^[0-9]+$/.test(value);
    }
    if (validation === "alpha-numeric") {
      return /^[a-zA-Z0-9_]+$/.test(value);
    }
    return true;
  }

  function isExpired(value) {
    if (!value) {
      return false;
    }
    var today = dateOnly(new Date());
    return dateOnly(value) < today;
  }

  function dateOnly(value) {
    var date = new Date(value);
    return new Date(date.getFullYear(), date.getMonth(), date.getDate());
  }

  function toCsv(rows) {
    if (!rows || !rows.length) {
      return "";
    }
    var columns = Object.keys(rows.reduce(function (acc, row) {
      angular.extend(acc, row);
      return acc;
    }, {}));

    var csvRows = [columns.join(",")];
    rows.forEach(function (row) {
      csvRows.push(columns.map(function (column) {
        var value = row[column];
        var safe = value === null || angular.isUndefined(value) ? "" : String(value).replace(/"/g, "\"\"");
        return "\"" + safe + "\"";
      }).join(","));
    });
    return csvRows.join("\r\n");
  }

  function downloadFile(content, filename, mimeType) {
    var blob = new Blob([content], { type: mimeType });
    var link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = filename;
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(link.href);
  }

  function copyText(text) {
    if (navigator.clipboard && navigator.clipboard.writeText) {
      navigator.clipboard.writeText(text).catch(function () {
        fallbackCopyText(text);
      });
      return;
    }
    fallbackCopyText(text);
  }

  function fallbackCopyText(text) {
    var textarea = document.createElement("textarea");
    textarea.value = text;
    textarea.setAttribute("readonly", "");
    textarea.style.position = "fixed";
    textarea.style.opacity = "0";
    document.body.appendChild(textarea);
    textarea.select();
    document.execCommand("copy");
    document.body.removeChild(textarea);
  }
})();
