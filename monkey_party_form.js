window.MonkeyParty = {};

window.MonkeyParty.EmailForm = function(options){
  options = options || {};
  this.url = options.url || "/list/emails.json";
  this.el = options.el;
  this.successCallback = options.success;
  this.errorCallback = options.error;
  this.validation = options.validation || 'alert';
  this.startCallback = options.start;
  this.completeCallback = options.complete;


  if(this.validation == 'alert'){
    this.validationCallback = function(msgArray){
      window.alert(msgArray.join(", "));
    }
  }
  else {
    this.validationCallback = this.validation
  }

  this.handleSuccess = function(subscriber){
    if(this.successCallback){
      this.successCallback(subscriber);
    }
  };

  this.handleError = function(jqXHR, textStatus, errorThrown){
    if(this.errorCallback){
      this.errorCallback(jqXHR, textStatus, errorThrown);
    }
  };

  this.submitStarted = function(){
    if(this.startCallback){
      this.startCallback();
    }
  };

  this.submitComplete = function(){
    if(this.completeCallback){
      this.completeCallback();
    }
  };

  this.validateEmail = function(){
    var $email = jQuery(this.el).children("input[name='subscriber[email]']");

    var errors = [];
    if($email){
      var emailRegex = /\b[A-Z0-9._%+-]+@[A-Z0-9.-]+\.[A-Z]{2,4}\b/;
      if($email.val() == ''){
        errors.push("Email is a required field");
      }
      else if(!emailRegex.exec($email.val())){
        errors.push("Email is not valid");
      }
    }
    return errors;
  };
  this.validate = function(){
    var errors = this.validateEmail();
    if(errors.length > 0){
      this.validationCallback(errors);
    }
  }
  this.submit = function(e){
    if(e){
      e.preventDefault();
    }

    this.validate();
    this.submitStarted();
    jQuery.ajax({
      statusCode: {
        201: jQuery.proxy(this.handleSuccess, this),
      },
      error: jQuery.proxy(this.handleError, this),
      complete: jQuery.proxy(this.submitComplete, this),
      url: this.url,
      type: "POST",
      data: jQuery(this.el).serialize(),
      context: this,
      dataType: "json"
    });
  };

  if(this.el){
    jQuery(this.el).on("submit", jQuery.proxy(this.submit, this));
  }
  else {
    throw "Form el not specified";
  }
};
