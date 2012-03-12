var MonkeyParty = {};

MonkeyParty.EmailForm = function(options){
  options = options || {};
  this.url = options.url || "/list/emails.json";
  this.el = options.el
  this.successCallback = options.success
  
  this.handleSuccess = function(subscriber){
    if(this.successCallback){
      this.successCallback(subscriber);
    }
  };

  this.submit = function(e){
    if(e){
      e.preventDefault();
    }

    jQuery.ajax({
      statusCode: {
        201: jQuery.proxy(this.handleSuccess, this) ,
      },
      error: function(xhr, textStatus){
      },
      url: this.url,
      type: "POST",
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
