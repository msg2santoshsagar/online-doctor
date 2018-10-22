/*jshint esversion: 6 */

function login(req, res) {

    var userName = null;
    var password = null;

    var reqBody = req.body;

    console.log("Req body :: ", reqBody.username);

    if (reqBody !== null) {
        userName = reqBody.username;
        password = reqBody.password;
    }

    if (userName === null) {
        console.log("Inside this");
        res.send({
            "code": 200,
            "status": "failed",
            "reason": "user name is missing"
        });
    }

    if (password === null) {
        console.log("Inside that");
        res.send({
            "code": 200,
            "status": "failed",
            "reason": "password is missing"
        });
    }

    if (userName == password) {

        req.session.put('id', userName);
        req.session.put('userName', userName);

        res.send({
            code: 200,
            "status": "pass"
        });
    } else {
        res.send({
            "code": 200,
            "status": "failed",
            "reason": "User name and password not matching"
        });
    }


}

function currentLoggedInUser(req, res) {

    //console.log("Request session :: ", req.session);

    var userName = req.session.get('userName');
    var loggedIn = true;

    if (userName === null || userName == undefined) {
        loggedIn = false;
    }

    var userData = {
        'name': userName,
        'loggedIn': loggedIn
    };

    console.log("USERDATA ==> ", userData);

    res.send({
        "code": 200,
        "user": userData
    });

}

function logout(req, res) {

    req.session.flush();

    res.send({
        "code": 200,
        "status": "loggedoff"
    });

}


module.exports = {
    login: login,
    currentLoggedInUser: currentLoggedInUser,
    logout: logout
};