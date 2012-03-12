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
  }); 

  describe("submitting an invalid form", function(){
    it("validates the email address");
  });
});
