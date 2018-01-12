let chai = require('chai');
let assert = chai.assert;
let request = require('./requestSimulator.js');
process.env.COMMENT_STORE = "./testStore.json";
let app = require('../js/app.js');
let th = require('./testHelper.js');

describe('app',()=>{
  describe('GET /noFile',()=>{
    it('responds with 404',done=>{
      request(app,{method:'GET',url:'/noFile'},(res)=>{
        assert.equal(res.statusCode,404);
        done();
      })
    })
  })
  describe('GET /',()=>{
    it('redirects to index.html',done=>{
      request(app,{method:'GET',url:'/'},(res)=>{
        th.should_be_redirected_to(res,'/index.html');
        assert.equal(res.body,"");
        done();
      })
    })
  })
  describe('GET /index.html',()=>{
    it('gives the index page',done=>{
      request(app,{method:'GET',url:'/index.html'},res=>{
        th.status_is_ok(res);
        th.content_type_is(res,'text/html');
        th.body_contains(res,'User Name');
        done();
      })
    })
  })
  describe('GET /public/docs/icon.png',()=>{
    it('serves the image',done=>{
      request(app,{method:'GET',url:'/public/docs/icon.png'},res=>{
        th.status_is_ok(res);
        th.content_type_is(res,'img/png');
        done();
      })
    })
  })
  describe('GET /index.html',()=>{
    it('serves the login page',done=>{
      request(app,{method:'GET',url:'/index.html'},res=>{
        th.status_is_ok(res);
        th.body_contains(res,'User Name:');
        th.body_does_not_contain(res,'login failed');
        th.should_not_have_cookie(res,'message');
        done();
      })
    })
  })

  describe('POST /',()=>{
    it('redirects to homePage for valid user',done=>{
      request(app,{method:'POST',url:'/homePage.html',body:'userName=manikm'},res=>{
        th.should_be_redirected_to(res,'/public/html/homePage.html');
        th.should_not_have_cookie(res,'message');
        done();
      })
    })
    it('redirects to login.html with message for invalid user',done=>{
      request(app,{method:'POST',url:'/homePage',body:'username=badUser'},res=>{
        th.should_be_redirected_to(res,'/index.html');
        done();
      })
    })
  })
})
