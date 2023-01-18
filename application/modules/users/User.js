class User {
    constructor({ id, userName, password, token }) {
        this.id = id;
        this.userName = userName;
        this.password = password;
        this.token = token;
    }

    fill({ id, userName, password, token}) {
        this.id = id;
        this.userName = userName;
        this.password = password;
        this.token = token; 
    }

    clone() {
        return new User({
            id: this.id,
            userName: this.userName,
            password: this.password,
            token: this.token
        });
    }

}

module.exports = User;