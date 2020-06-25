const chai =require("chai");
const chaiHttp =require("chai-http");
chai.use(chaiHttp);

const server = require("./server");

describe('should GET /items/all status(200)', function() {
    it('should return 200', function (done) {
        //this.timeout(10000);
        setTimeout(done, 1000);
        server.get('/items/all', function (err, res, body){
            expect(res.statusCode).to.equal(200);
            done();
        });
    });
});
