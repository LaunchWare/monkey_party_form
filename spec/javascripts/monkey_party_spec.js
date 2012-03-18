window.alert = function(){  
  // console.log(arguments[0]);
}

describe("a monkey party form", function(){
  beforeEach(function(){
    this.subject = new MonkeyParty.EmailForm({
      el: jQuery("<form>")
    });

    this.submitAndRespond = function(response){
      var modResponse = response;
      if(!(modResponse[2] instanceof String)){
        modResponse[2] = JSON.stringify(modResponse[2]);
      }

      this.server.respondWith(modResponse)
      this.subject.submit();
      this.server.respond();
    }

    this.buildForm = function(emailValue){
      var $emailInput = jQuery("<input>").
        attr("type", "text").
        attr("name", "subscriber[email]").
        val(emailValue);

      return jQuery("<form>").
        append($emailInput);
    };
  }); 

  it("has a settable url", function(){
    path = "/some_url.json";
    var setUrl = new MonkeyParty.EmailForm({
      url: path,
      el: jQuery("<form>")
    });

    expect(setUrl.url).toEqual(path);
  });

  it("has a default url to /list/emails.json", function(){
    expect(this.subject.url).toEqual('/list/emails.json');
  });

  it("requires a form element", function(){
    expect(function(){ 
      new MonkeyParty.EmailForm();
    }).toThrow("Form el not specified");
  });

  it("binds submit to the element's submit event", function(){
    var mock = sinon.mock(this.subject);
    mock.expects("submit").once()
    
    jQuery(this.subject.el).trigger("submit");
  });

  describe("submitting a valid form", function(){
    beforeEach(function(){
      this.server = sinon.fakeServer.create();
    });

    afterEach(function(){
      this.server.restore();
    });

    it("calls a success callback", function(){
      var success = function(){};

      this.subject = new MonkeyParty.EmailForm({
        el: jQuery("<form>"),
        success: success
      });

      spyOn(this.subject, "successCallback");

      this.submitAndRespond([201, {}, {
        email: "user@example.com"
      }]);      
      
      expect(this.subject.successCallback).
        toHaveBeenCalled();
    });

    it("sends the subscriber's json as an argument to the callback", function(){
      var success = function(subscriber){
        expect(subscriber.email).toBeDefined();
      }

      this.subject = new MonkeyParty.EmailForm({
        el: jQuery("<form>"),
        success: success
      });
    });

    it("passes validation with a valid email", function(){
      var $form = this.buildForm("user@example.com");
      spyOn(window, "alert");
      this.subject = new MonkeyParty.EmailForm({
        el: $form,
        validation: 'alert'
      });

      this.subject.submit();
      expect(window.alert.called).toBeFalsy();
    });
  }); 
 
  describe("submitting an invalid form", function(){
    it("validates the presence email address", function() {
      var $form = this.buildForm("");

      spyOn(window, "alert");
      this.subject = new MonkeyParty.EmailForm({
        el: $form,
        validation: 'alert'
      });
      this.subject.submit();
      expect(window.alert).toHaveBeenCalled();

    });

    it("validates the format of the email", function(){
      var $form = this.buildForm("badEmail"); 
      spyOn(window, "alert");
      this.subject = new MonkeyParty.EmailForm({
        el: $form,
        validation: 'alert'
      });
      this.subject.submit();
      expect(window.alert).toHaveBeenCalled();
    });

    it("allows for a custom validation mechanism that gets fired", function(){
      var $form = this.buildForm("badEmail");
      var customVal = {};
      customVal.val = function(errors){};
      spyOn(customVal, "val");

      this.subject = new MonkeyParty.EmailForm({
        el: $form,
        validation: customVal.val
      });

      this.subject.submit();
      expect(customVal.val).toHaveBeenCalled();
    });

    it("calls an error callback when an error occurs", function(){
      var error = {};
      error.callback = function(){};
      spyOn(error, "callback");
      
      this.server = sinon.fakeServer.create();
      this.subject = new MonkeyParty.EmailForm({
        el: jQuery("<form>"),
        error: error.callback
      });

      this.submitAndRespond([422, {}, {}]);

      expect(error.callback).toHaveBeenCalled();
      this.server.restore();
    });

    it("calls a started callback when submission starts", function(){
      var cb = {};
      cb.callback = function(){};
      spyOn(cb, "callback");
      this.server = sinon.fakeServer.create();
      this.subject = new MonkeyParty.EmailForm({
        el: jQuery("<form>"),
        start: cb.callback
      });

      this.subject.submit();
      expect(cb.callback).toHaveBeenCalled();
    });

    it("calls a complete callback when submission completes", function(){
      var cb = {};
      cb.callback = function(){};
      spyOn(cb, "callback");
      this.server = sinon.fakeServer.create();
      this.subject = new MonkeyParty.EmailForm({
        el: jQuery("<form>"),
        complete: cb.callback
      });

      this.submitAndRespond([201, {}, {}]);
      expect(cb.callback).toHaveBeenCalled();
    });
  });
});
